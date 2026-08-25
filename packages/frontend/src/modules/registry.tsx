import type { ComponentType } from 'react';
import type { ModuleDataEnvelope, ModuleInstance } from '@dashboard/shared';
import { GithubModule } from './github/GithubModule';
import { HackerNewsModule } from './hackernews/HackerNewsModule';
import { GoogleTasksModule } from './google-tasks/GoogleTasksModule';
import { GoogleTasksConfigForm } from './google-tasks/GoogleTasksConfigForm';
import { googleTasksTitleSuffix } from './google-tasks/dateFilterLabels';
import { EmbedModule } from './embed/EmbedModule';
import { EmbedConfigForm } from './embed/EmbedConfigForm';
import { embedTitle, embedTitleIcon } from './embed/embedTitle';
import { SlashdotModule } from './slashdot/SlashdotModule';
import { GmailModule } from './gmail/GmailModule';
import { GmailConfigForm } from './gmail/GmailConfigForm';
import { GithubReposModule } from './github-repos/GithubReposModule';
import { GithubReposConfigForm } from './github-repos/GithubReposConfigForm';

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
  /** Overrides the card title text entirely (falls back to the module type's displayName). */
  getTitle?: (instance: ModuleInstance<TConfig>) => string | undefined;
  /** URL of a small icon shown before the card title. */
  getTitleIcon?: (instance: ModuleInstance<TConfig>) => string | undefined;
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
  embed: {
    Display: EmbedModule,
    ConfigForm: EmbedConfigForm,
    defaultConfig: { url: '', mode: 'iframe' },
    getTitle: embedTitle,
    getTitleIcon: embedTitleIcon,
  },
  slashdot: { Display: SlashdotModule, defaultConfig: { limit: 15 } },
  gmail: {
    Display: GmailModule,
    ConfigForm: GmailConfigForm,
    defaultConfig: { query: 'is:unread', maxResults: 10 },
  },
  'github-repos': {
    Display: GithubReposModule,
    ConfigForm: GithubReposConfigForm,
    defaultConfig: { scope: 'owned', sort: 'pushed', limit: 10 },
  },
};
