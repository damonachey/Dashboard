import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { eq } from 'drizzle-orm';
import {
  createModuleInstanceSchema,
  patchModuleInstanceSchema,
  configSchemasByModuleTypeId,
  type ModuleDataEnvelope,
} from '@dashboard/shared';
import { db } from '../../db/client.js';
import { moduleInstances, moduleData } from '../../db/schema.js';
import { getModuleDefinition } from '../../modules/registry.js';
import { scheduler } from '../../scheduler/instance.js';

// Mounted at /api/tabs/:tabId/modules
export const moduleInstancesRouterForTab = Router({ mergeParams: true });

moduleInstancesRouterForTab.post('/', (req, res) => {
  const parsed = createModuleInstanceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(parsed.error.flatten());
    return;
  }

  const def = getModuleDefinition(parsed.data.moduleTypeId);
  if (!def) {
    res.status(400).json({ error: `Unknown moduleTypeId: ${parsed.data.moduleTypeId}` });
    return;
  }

  const configSchema = configSchemasByModuleTypeId[parsed.data.moduleTypeId] ?? def.configSchema;
  const configParsed = configSchema.safeParse(parsed.data.config ?? {});
  if (!configParsed.success) {
    res.status(400).json(configParsed.error.flatten());
    return;
  }

  const { tabId } = req.params as { tabId: string };
  const maxPosition = db
    .select()
    .from(moduleInstances)
    .all()
    .filter((m) => m.tabId === tabId)
    .reduce((max, m) => Math.max(max, m.position), -1);

  const instance = {
    id: randomUUID(),
    tabId,
    moduleTypeId: parsed.data.moduleTypeId,
    position: maxPosition + 1,
    config: configParsed.data,
    createdAt: new Date().toISOString(),
  };
  db.insert(moduleInstances).values(instance).run();

  if (def.meta.kind === 'api') {
    db.insert(moduleData)
      .values({
        moduleInstanceId: instance.id,
        status: 'pending',
        data: null,
        lastFetchedAt: null,
        lastErrorAt: null,
        lastErrorMessage: null,
        consecutiveErrors: 0,
      })
      .run();
  }

  scheduler.onInstancesChanged();
  res.status(201).json(instance);
});

// Mounted at /api/module-instances
export const moduleInstancesRouter = Router();

moduleInstancesRouter.get('/:id/data', (req, res) => {
  const row = db.select().from(moduleData).where(eq(moduleData.moduleInstanceId, req.params.id)).get();

  const envelope: ModuleDataEnvelope = row
    ? {
        moduleInstanceId: row.moduleInstanceId,
        status: row.status as ModuleDataEnvelope['status'],
        data: row.data ?? null,
        lastFetchedAt: row.lastFetchedAt,
        lastErrorMessage: row.lastErrorMessage,
      }
    : {
        moduleInstanceId: req.params.id,
        status: 'pending',
        data: null,
        lastFetchedAt: null,
        lastErrorMessage: null,
      };

  res.json(envelope);
});

moduleInstancesRouter.patch('/:id', (req, res) => {
  const parsed = patchModuleInstanceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(parsed.error.flatten());
    return;
  }

  const existing = db.select().from(moduleInstances).where(eq(moduleInstances.id, req.params.id)).get();
  if (!existing) {
    res.status(404).end();
    return;
  }

  const patch: { position?: number; config?: unknown } = {};
  if (parsed.data.position !== undefined) patch.position = parsed.data.position;

  if (parsed.data.config !== undefined) {
    const configSchema = configSchemasByModuleTypeId[existing.moduleTypeId] ?? getModuleDefinition(existing.moduleTypeId)?.configSchema;
    if (!configSchema) {
      res.status(400).json({ error: 'Unknown module type' });
      return;
    }
    const configParsed = configSchema.safeParse(parsed.data.config);
    if (!configParsed.success) {
      res.status(400).json(configParsed.error.flatten());
      return;
    }
    patch.config = configParsed.data;
  }

  db.update(moduleInstances).set(patch).where(eq(moduleInstances.id, req.params.id)).run();
  const updated = db.select().from(moduleInstances).where(eq(moduleInstances.id, req.params.id)).get();
  scheduler.onInstancesChanged();
  res.json(updated);
});

moduleInstancesRouter.delete('/:id', (req, res) => {
  db.delete(moduleInstances).where(eq(moduleInstances.id, req.params.id)).run();
  scheduler.onInstancesChanged();
  res.status(204).end();
});
