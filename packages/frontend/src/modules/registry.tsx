import type { ComponentType } from 'react';
import type { ModuleDataEnvelope, ModuleInstance } from '@dashboard/shared';
import { GithubModule } from './github/GithubModule';
import { HackerNewsModule } from './hackernews/HackerNewsModule';
import { GoogleTasksModule } from './google-tasks/GoogleTasksModule';
import { GoogleTasksConfigForm } from './google-tasks/GoogleTasksConfigForm';
import { googleTasksTitleSuffix } from './google-tasks/dateFilterLabels';
import { EmbedModule } from './embed/EmbedModule';
import { EmbedConfigForm } from './embed/EmbedConfigForm';
import { SlashdotModule } from './slashdot/SlashdotModule';

export interface ModuleDisplayProps<TConfig = unknown, TData = unknown> {
  instance: ModuleInstance<TConfig>;
  envelope?: ModuleDataEnvelope<TData>;
}

export interface ModuleConfigFormProps<TConfig = unknown> {
  value: TConfig;
  onChange: (next: TConfig) => void;
}

export interface ModuleUiDefinition<TConfig = unknown, TData = unknown> {
  Display: ComponentType<ModuleDisplayProps<TConfig, TData>>;
  ConfigForm?: ComponentType<ModuleConfigFormProps<TConfig>>;
  defaultConfig?: TConfig;
  /** Short text appended to the card title, e.g. a summary of the active config. */
  getTitleSuffix?: (instance: ModuleInstance<TConfig>) => string | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const moduleRegistry: Record<string, ModuleUiDefinition<any, any>> = {
  'github-notifications': { Display: GithubModule, defaultConfig: { scope: 'notifications' } },
  'hacker-news': { Display: HackerNewsModule, defaultConfig: { limit: 15 } },
  'google-tasks': {
    Display: GoogleTasksModule,
    ConfigForm: GoogleTasksConfigForm,
    defaultConfig: { taskListId: '@default', maxResults: 20, dateFilters: ['all'] },
    getTitleSuffix: googleTasksTitleSuffix,
  },
  embed: { Display: EmbedModule, ConfigForm: EmbedConfigForm, defaultConfig: { url: '', mode: 'iframe' } },
  slashdot: { Display: SlashdotModule, defaultConfig: { limit: 15 } },
};
