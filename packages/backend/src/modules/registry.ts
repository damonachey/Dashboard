import type { ModuleTypeMeta } from '@dashboard/shared';
import type { ModuleDefinition } from './types.js';
import { githubModule } from './github/index.js';
import { hackerNewsModule } from './hackernews/index.js';
import { googleTasksModule } from './google-tasks/index.js';
import { googleCalendarModule } from './google-calendar/index.js';
import { embedModule } from './embed/index.js';
import { slashdotModule } from './slashdot/index.js';
import { gmailModule } from './gmail/index.js';
import { githubReposModule } from './github-repos/index.js';
import { freshRssModule } from './freshrss/index.js';
import { notesModule } from './notes/index.js';
import { stockQuotesModule } from './stock-quotes/index.js';
import { stockChartModule } from './stock-chart/index.js';
import { weatherModule } from './weather/index.js';

const registry = new Map<string, ModuleDefinition<any, any>>();

function registerModule(def: ModuleDefinition<any, any>): void {
  registry.set(def.meta.id, def);
}

for (const def of [
  githubModule,
  hackerNewsModule,
  googleTasksModule,
  googleCalendarModule,
  embedModule,
  slashdotModule,
  gmailModule,
  githubReposModule,
  freshRssModule,
  notesModule,
  stockQuotesModule,
  stockChartModule,
  weatherModule,
]) {
  registerModule(def);
}

export function getModuleDefinition(id: string): ModuleDefinition<any, any> | undefined {
  return registry.get(id);
}

export function listModuleTypeMeta(): ModuleTypeMeta[] {
  return Array.from(registry.values()).map((def) => def.meta);
}
