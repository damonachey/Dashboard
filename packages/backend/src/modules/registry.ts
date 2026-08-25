import type { ModuleTypeMeta } from '@dashboard/shared';
import type { ModuleDefinition } from './types.js';
import { githubModule } from './github/index.js';
import { hackerNewsModule } from './hackernews/index.js';
import { googleTasksModule } from './google-tasks/index.js';
import { embedModule } from './embed/index.js';

const registry = new Map<string, ModuleDefinition<any, any>>();

function registerModule(def: ModuleDefinition<any, any>): void {
  registry.set(def.meta.id, def);
}

for (const def of [githubModule, hackerNewsModule, googleTasksModule, embedModule]) {
  registerModule(def);
}

export function getModuleDefinition(id: string): ModuleDefinition<any, any> | undefined {
  return registry.get(id);
}

export function listModuleTypeMeta(): ModuleTypeMeta[] {
  return Array.from(registry.values()).map((def) => def.meta);
}
