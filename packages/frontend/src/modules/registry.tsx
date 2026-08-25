import type { ComponentType } from 'react';
import type { ModuleDataEnvelope, ModuleInstance } from '@dashboard/shared';
import { GithubModule } from './github/GithubModule';
import { HackerNewsModule } from './hackernews/HackerNewsModule';
import { GoogleTasksModule } from './google-tasks/GoogleTasksModule';
import { GoogleTasksConfigForm } from './google-tasks/GoogleTasksConfigForm';
import { googleTasksTitleSuffix } from './google-tasks/dateFilterLabels';
import { EmbedModule } from './embed/EmbedModule';
import { EmbedConfigForm } from './embed/EmbedConfigForm';
import { embedTitle, embedTitleIcon, embedSourceUrl } from './embed/embedTitle';
import { SlashdotModule } from './slashdot/SlashdotModule';
import { GmailModule } from './gmail/GmailModule';
import { GmailConfigForm } from './gmail/GmailConfigForm';
import { GithubReposModule } from './github-repos/GithubReposModule';
import { GithubReposConfigForm } from './github-repos/GithubReposConfigForm';
import { FreshRssModule } from './freshrss/FreshRssModule';
import { NotesModule } from './notes/NotesModule';
import { NotesConfigForm } from './notes/NotesConfigForm';
import { notesTitle } from './notes/notesTitle';

export interface ModuleDisplayProps<TConfig = unknown, TData = unknown> {
  instance: ModuleInstance<TConfig>;
  envelope?: ModuleDataEnvelope<TData>;
  /** id (or url) of a search-selected item within this module's data, to highlight/scroll to. */
  highlightedItemId?: string;
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
  /** URL of the module's source/origin site, shown as an "open in new tab" link. */
  getSourceUrl?: (instance: ModuleInstance<TConfig>) => string | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const moduleRegistry: Record<string, ModuleUiDefinition<any, any>> = {
  'github-notifications': {
    Display: GithubModule,
    defaultConfig: { scope: 'notifications' },
    getSourceUrl: () => 'https://github.com/notifications',
  },
  'hacker-news': {
    Display: HackerNewsModule,
    defaultConfig: { limit: 15 },
    getSourceUrl: () => 'https://news.ycombinator.com',
  },
  'google-tasks': {
    Display: GoogleTasksModule,
    ConfigForm: GoogleTasksConfigForm,
    defaultConfig: { taskListId: '@default', maxResults: 20, dateFilters: ['all'] },
    getTitleSuffix: googleTasksTitleSuffix,
    getSourceUrl: () => 'https://tasks.google.com',
  },
  embed: {
    Display: EmbedModule,
    ConfigForm: EmbedConfigForm,
    defaultConfig: { url: '', mode: 'iframe', title: '' },
    getTitle: embedTitle,
    getTitleIcon: embedTitleIcon,
    getSourceUrl: embedSourceUrl,
  },
  slashdot: {
    Display: SlashdotModule,
    defaultConfig: { limit: 15 },
    getSourceUrl: () => 'https://slashdot.org',
  },
  gmail: {
    Display: GmailModule,
    ConfigForm: GmailConfigForm,
    defaultConfig: { query: 'is:unread', maxResults: 10 },
    getSourceUrl: () => 'https://mail.google.com/mail/u/0/#inbox',
  },
  'github-repos': {
    Display: GithubReposModule,
    ConfigForm: GithubReposConfigForm,
    defaultConfig: { scope: 'owned', sort: 'pushed', limit: 10 },
    getSourceUrl: () => 'https://github.com',
  },
  freshrss: {
    Display: FreshRssModule,
    defaultConfig: { limit: 15 },
    getSourceUrl: () => 'http://192.168.0.9/FreshRSS/',
  },
  notes: {
    Display: NotesModule,
    ConfigForm: NotesConfigForm,
    defaultConfig: { title: 'Notes', text: '' },
    getTitle: notesTitle,
  },
};
