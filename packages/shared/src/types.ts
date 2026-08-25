export type ModuleKind = 'api' | 'embed';

export interface ModuleTypeMeta {
  id: string;
  displayName: string;
  kind: ModuleKind;
  /** present only when kind === 'api' */
  defaultPollIntervalMs?: number;
}

export interface Tab {
  id: string;
  name: string;
  position: number;
  createdAt: string;
}

export interface ModuleInstance<TConfig = unknown> {
  id: string;
  tabId: string;
  moduleTypeId: string;
  position: number;
  config: TConfig;
  createdAt: string;
}

export interface TabWithModules extends Tab {
  modules: ModuleInstance[];
}

export type ModuleDataStatus = 'ok' | 'error' | 'pending';

export interface ModuleDataEnvelope<TData = unknown> {
  moduleInstanceId: string;
  status: ModuleDataStatus;
  data: TData | null;
  lastFetchedAt: string | null;
  lastErrorMessage: string | null;
}

export interface GoogleAuthStatus {
  authorized: boolean;
}

// --- Module data shapes ---

export interface GithubNotificationItem {
  id: string;
  title: string;
  repo: string;
  reason: string;
  type: string;
  url: string;
  updatedAt: string;
  unread: boolean;
}

export interface GithubModuleData {
  notifications: GithubNotificationItem[];
}

export interface HackerNewsItem {
  id: number;
  title: string;
  url: string | null;
  score: number;
  by: string;
  commentsCount: number;
  hnUrl: string;
}

export interface HackerNewsModuleData {
  items: HackerNewsItem[];
}

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes: string | null;
  due: string | null;
  status: 'needsAction' | 'completed';
  taskListId: string;
}

export interface GoogleTasksModuleData {
  tasks: GoogleTaskItem[];
}

export interface SlashdotItem {
  title: string;
  url: string;
  section: string | null;
  creator: string | null;
  publishedAt: string | null;
}

export interface SlashdotModuleData {
  items: SlashdotItem[];
}

export interface GmailMessageItem {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  snippet: string;
  receivedAt: string | null;
  unread: boolean;
}

export interface GmailModuleData {
  unreadCount: number;
  messages: GmailMessageItem[];
}
