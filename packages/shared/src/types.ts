export type ModuleKind = 'api' | 'embed' | 'local';

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

export interface GoogleCalendarEventItem {
  id: string;
  title: string;
  /** ISO datetime, or an ISO date (YYYY-MM-DD) when allDay is true */
  start: string;
  end: string;
  allDay: boolean;
  location: string | null;
  htmlLink: string | null;
}

export interface GoogleCalendarModuleData {
  events: GoogleCalendarEventItem[];
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

export interface GithubRepoItem {
  id: number;
  fullName: string;
  description: string | null;
  url: string;
  private: boolean;
  stars: number;
  language: string | null;
  openIssues: number;
  pushedAt: string | null;
}

export interface GithubReposModuleData {
  repos: GithubRepoItem[];
}

export interface FreshRssItem {
  id: string;
  title: string;
  author: string | null;
  url: string;
  feedTitle: string | null;
  publishedAt: string | null;
}

export interface FreshRssModuleData {
  items: FreshRssItem[];
}

export interface StockQuoteItem {
  /** equal to `symbol` — present so search result highlighting works like every other module's items */
  id: string;
  symbol: string;
  name: string | null;
  price: number | null;
  previousClose: number | null;
  change: number | null;
  changePercent: number | null;
  currency: string | null;
  marketTime: string | null;
  /** set when this ticker's quote couldn't be fetched (e.g. unknown symbol); other fields are null */
  error: string | null;
}

export interface StockQuotesModuleData {
  quotes: StockQuoteItem[];
}

export interface WeatherForecastDayItem {
  id: string;
  /** e.g. "Tue 8/25" */
  date: string;
  /** °F; null for today once the day's actual high is already known/passed on wunderground.com */
  high: number | null;
  /** °F */
  low: number | null;
  condition: string | null;
  iconUrl: string | null;
}

export interface WeatherModuleData {
  /** "<City>, <ST>" for a zip-code lookup, or the station ID as typed for a PWS station */
  location: string;
  days: WeatherForecastDayItem[];
}

export interface SearchResult {
  tabId: string;
  tabName: string;
  /** absent for matchType 'tab' — the result is the tab itself, not a specific module */
  moduleInstanceId?: string;
  moduleTitle?: string;
  matchType: 'tab' | 'title' | 'content';
  snippet: string;
  /** id (or url, for items without one) of the specific matched item within the module's data */
  itemId?: string;
}
