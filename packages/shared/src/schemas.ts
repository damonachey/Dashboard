import { z } from 'zod';

export const embedConfigSchema = z.object({
  url: z.string().url(),
  mode: z.enum(['iframe', 'link']).default('iframe'),
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

export const hackerNewsConfigSchema = z.object({
  limit: z.number().int().min(1).max(50).default(15),
});
export type HackerNewsConfig = z.infer<typeof hackerNewsConfigSchema>;

export const slashdotConfigSchema = z.object({
  limit: z.number().int().min(1).max(30).default(15),
});
export type SlashdotConfig = z.infer<typeof slashdotConfigSchema>;

export const configSchemasByModuleTypeId: Record<string, z.ZodTypeAny> = {
  embed: embedConfigSchema,
  'github-notifications': githubModuleConfigSchema,
  'google-tasks': googleTasksConfigSchema,
  'hacker-news': hackerNewsConfigSchema,
  slashdot: slashdotConfigSchema,
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
