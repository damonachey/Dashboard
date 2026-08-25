import type { ZodType, ZodTypeDef } from 'zod';
import type { OAuth2Client } from 'google-auth-library';
import type { ModuleTypeMeta } from '@dashboard/shared';
import type { DrizzleDb } from '../db/client.js';
import type { Env } from '../config/env.js';

export interface PollContext {
  moduleInstanceId: string;
  db: DrizzleDb;
  env: Env;
  getGoogleClient(): Promise<OAuth2Client>;
}

export interface ModuleDefinition<TConfig = unknown, TData = unknown> {
  meta: ModuleTypeMeta;
  // Input left as `any`: schemas use .default(), so their real parse input allows
  // optional fields, which doesn't structurally match TConfig (the parsed output type).
  configSchema: ZodType<TConfig, ZodTypeDef, any>;
  /** required iff meta.kind === 'api' */
  fetchData?(config: TConfig, ctx: PollContext): Promise<TData>;
}
