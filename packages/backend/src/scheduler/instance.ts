import { ModuleScheduler } from './scheduler.js';
import { db } from '../db/client.js';
import { env } from '../config/env.js';

export const scheduler = new ModuleScheduler(db, env);
