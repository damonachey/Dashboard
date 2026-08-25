import { eq } from 'drizzle-orm';
import type { DrizzleDb } from '../db/client.js';
import type { Env } from '../config/env.js';
import { moduleInstances, moduleData } from '../db/schema.js';
import { getModuleDefinition } from '../modules/registry.js';
import { getStoredGoogleClient } from '../integrations/google/oauthClient.js';
import { RateLimitedError } from '../util/errors.js';
import { logger } from '../util/logger.js';
import type { PollContext } from '../modules/types.js';

const MAX_BACKOFF_MS = 60 * 60 * 1000;
const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;

interface ModuleDataPatch {
  status: 'ok' | 'error' | 'pending';
  data?: unknown;
  lastFetchedAt?: string | null;
  lastErrorAt?: string | null;
  lastErrorMessage?: string | null;
  consecutiveErrors?: number;
}

export class ModuleScheduler {
  private timers = new Map<string, NodeJS.Timeout>();

  constructor(
    private db: DrizzleDb,
    private env: Env,
  ) {}

  start(): void {
    this.onInstancesChanged();
  }

  stop(): void {
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
  }

  onInstancesChanged(): void {
    const instances = this.db.select().from(moduleInstances).all();
    const liveIds = new Set<string>();

    for (const instance of instances) {
      const def = getModuleDefinition(instance.moduleTypeId);
      if (!def || def.meta.kind !== 'api' || !def.fetchData) continue;

      liveIds.add(instance.id);
      if (this.timers.has(instance.id)) continue;

      this.scheduleNext(instance.id, 0);
    }

    for (const [id, timer] of this.timers) {
      if (!liveIds.has(id)) {
        clearTimeout(timer);
        this.timers.delete(id);
      }
    }
  }

  private scheduleNext(instanceId: string, delayMs: number): void {
    const timer = setTimeout(() => {
      void this.runPoll(instanceId);
    }, delayMs);
    this.timers.set(instanceId, timer);
  }

  private async runPoll(instanceId: string): Promise<void> {
    const instance = this.db.select().from(moduleInstances).where(eq(moduleInstances.id, instanceId)).get();
    if (!instance) {
      this.timers.delete(instanceId);
      return;
    }

    const def = getModuleDefinition(instance.moduleTypeId);
    if (!def?.fetchData) {
      this.timers.delete(instanceId);
      return;
    }

    const defaultInterval = def.meta.defaultPollIntervalMs ?? DEFAULT_INTERVAL_MS;
    const existing = this.db.select().from(moduleData).where(eq(moduleData.moduleInstanceId, instanceId)).get();
    const consecutiveErrors = existing?.consecutiveErrors ?? 0;

    const ctx: PollContext = {
      moduleInstanceId: instanceId,
      db: this.db,
      env: this.env,
      getGoogleClient: () => getStoredGoogleClient(this.db, this.env),
    };

    try {
      const config = def.configSchema.parse(instance.config);
      const data = await def.fetchData(config, ctx);
      this.upsertModuleData(instanceId, {
        status: 'ok',
        data,
        lastFetchedAt: new Date().toISOString(),
        lastErrorAt: null,
        lastErrorMessage: null,
        consecutiveErrors: 0,
      });
      this.scheduleNext(instanceId, defaultInterval);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn(`Module ${instance.moduleTypeId} (${instanceId}) poll failed: ${message}`);

      if (err instanceof RateLimitedError) {
        this.upsertModuleData(instanceId, {
          status: 'error',
          lastErrorAt: new Date().toISOString(),
          lastErrorMessage: message,
          consecutiveErrors: consecutiveErrors + 1,
        });
        this.scheduleNext(instanceId, err.retryAfterMs);
        return;
      }

      const nextErrors = consecutiveErrors + 1;
      const backoff = Math.min(defaultInterval * 2 ** nextErrors, MAX_BACKOFF_MS);
      this.upsertModuleData(instanceId, {
        status: 'error',
        lastErrorAt: new Date().toISOString(),
        lastErrorMessage: message,
        consecutiveErrors: nextErrors,
      });
      this.scheduleNext(instanceId, backoff);
    }
  }

  private upsertModuleData(instanceId: string, patch: ModuleDataPatch): void {
    const existing = this.db.select().from(moduleData).where(eq(moduleData.moduleInstanceId, instanceId)).get();
    if (existing) {
      this.db.update(moduleData).set(patch).where(eq(moduleData.moduleInstanceId, instanceId)).run();
    } else {
      this.db
        .insert(moduleData)
        .values({
          moduleInstanceId: instanceId,
          status: 'pending',
          data: null,
          lastFetchedAt: null,
          lastErrorAt: null,
          lastErrorMessage: null,
          consecutiveErrors: 0,
          ...patch,
        })
        .run();
    }
  }
}
