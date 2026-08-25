import type { ComponentType } from 'react';
import type { ModuleDataEnvelope, ModuleInstance } from '@dashboard/shared';
import { GithubModule } from './github/GithubModule';
import { HackerNewsModule } from './hackernews/HackerNewsModule';
import { GoogleTasksModule } from './google-tasks/GoogleTasksModule';
import { GoogleTasksConfigForm } from './google-tasks/GoogleTasksConfigForm';
import { EmbedModule } from './embed/EmbedModule';
import { EmbedConfigForm } from './embed/EmbedConfigForm';

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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const moduleRegistry: Record<string, ModuleUiDefinition<any, any>> = {
  'github-notifications': { Display: GithubModule, defaultConfig: { scope: 'notifications' } },
  'hacker-news': { Display: HackerNewsModule, defaultConfig: { limit: 15 } },
  'google-tasks': {
    Display: GoogleTasksModule,
    ConfigForm: GoogleTasksConfigForm,
    defaultConfig: { taskListId: '@default', maxResults: 20, dateFilters: ['all'] },
  },
  embed: { Display: EmbedModule, ConfigForm: EmbedConfigForm, defaultConfig: { url: '', mode: 'iframe' } },
};
