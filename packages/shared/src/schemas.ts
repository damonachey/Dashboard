import { z } from 'zod';

export const embedConfigSchema = z.object({
  url: z.string().url(),
  mode: z.enum(['iframe', 'link']).default('iframe'),
  /** Overrides the card title; falls back to the URL's hostname when blank. */
  title: z.string().default(''),
});
export type EmbedConfig = z.infer<typeof embedConfigSchema>;

export const githubModuleConfigSchema = z.object({
  scope: z.enum(['notifications', 'assigned-issues']).default('notifications'),
});
export type GithubModuleConfig = z.infer<typeof githubModuleConfigSchema>;

export const googleTasksDateFilterOptions = ['past', 'today', 'tomorrow', 'next7Days', 'next30Days', 'all'] as const;
export type GoogleTasksDateFilter = (typeof googleTasksDateFilterOptions)[number];

export const googleTasksConfigSchema = z.object({
  taskListId: z.string().default('@default'),
  maxResults: z.number().int().min(1).max(100).default(20),
  dateFilters: z.array(z.enum(googleTasksDateFilterOptions)).min(1).default(['all']),
});
export type GoogleTasksConfig = z.infer<typeof googleTasksConfigSchema>;

export const googleCalendarConfigSchema = z.object({
  calendarId: z.string().default('primary'),
  daysAhead: z.number().int().min(1).max(60).default(7),
  maxResults: z.number().int().min(1).max(100).default(15),
});
export type GoogleCalendarConfig = z.infer<typeof googleCalendarConfigSchema>;

export const hackerNewsConfigSchema = z.object({
  limit: z.number().int().min(1).max(50).default(15),
});
export type HackerNewsConfig = z.infer<typeof hackerNewsConfigSchema>;

export const slashdotConfigSchema = z.object({
  limit: z.number().int().min(1).max(30).default(15),
});
export type SlashdotConfig = z.infer<typeof slashdotConfigSchema>;

export const gmailConfigSchema = z.object({
  query: z.string().min(1).default('is:unread'),
  maxResults: z.number().int().min(1).max(50).default(10),
});
export type GmailConfig = z.infer<typeof gmailConfigSchema>;

export const githubReposConfigSchema = z.object({
  scope: z.enum(['owned', 'starred']).default('owned'),
  sort: z.enum(['pushed', 'updated', 'created', 'full_name']).default('pushed'),
  limit: z.number().int().min(1).max(50).default(10),
});
export type GithubReposConfig = z.infer<typeof githubReposConfigSchema>;

export const freshRssConfigSchema = z.object({
  limit: z.number().int().min(1).max(50).default(15),
});
export type FreshRssConfig = z.infer<typeof freshRssConfigSchema>;

export const stockQuotesConfigSchema = z.object({
  /** Raw comma-separated tickers as typed, e.g. "AAPL, MSFT, GOOGL" — normalized when fetched. */
  tickers: z.string().min(1).default('AAPL,MSFT,GOOGL'),
});
export type StockQuotesConfig = z.infer<typeof stockQuotesConfigSchema>;

export const notesConfigSchema = z.object({
  title: z.string().min(1).max(60).default('Notes'),
  text: z.string().default(''),
});
export type NotesConfig = z.infer<typeof notesConfigSchema>;

export const configSchemasByModuleTypeId: Record<string, z.ZodTypeAny> = {
  embed: embedConfigSchema,
  'github-notifications': githubModuleConfigSchema,
  'google-tasks': googleTasksConfigSchema,
  'google-calendar': googleCalendarConfigSchema,
  'hacker-news': hackerNewsConfigSchema,
  slashdot: slashdotConfigSchema,
  gmail: gmailConfigSchema,
  'github-repos': githubReposConfigSchema,
  freshrss: freshRssConfigSchema,
  'stock-quotes': stockQuotesConfigSchema,
  notes: notesConfigSchema,
};

export const createTabSchema = z.object({
  name: z.string().min(1).max(60),
});

export const patchTabSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  position: z.number().int().min(0).optional(),
});

export const createModuleInstanceSchema = z.object({
  moduleTypeId: z.string().min(1),
  config: z.unknown(),
});

export const patchModuleInstanceSchema = z.object({
  config: z.unknown().optional(),
  position: z.number().int().min(0).optional(),
});
