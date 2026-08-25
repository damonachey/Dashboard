import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const tabs = sqliteTable('tabs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  position: integer('position').notNull(),
  createdAt: text('created_at').notNull(),
});

export const moduleInstances = sqliteTable('module_instances', {
  id: text('id').primaryKey(),
  tabId: text('tab_id')
    .notNull()
    .references(() => tabs.id, { onDelete: 'cascade' }),
  moduleTypeId: text('module_type_id').notNull(),
  position: integer('position').notNull(),
  config: text('config', { mode: 'json' }).notNull(),
  createdAt: text('created_at').notNull(),
});

export const moduleData = sqliteTable('module_data', {
  moduleInstanceId: text('module_instance_id')
    .primaryKey()
    .references(() => moduleInstances.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('pending'),
  data: text('data', { mode: 'json' }),
  lastFetchedAt: text('last_fetched_at'),
  lastErrorAt: text('last_error_at'),
  lastErrorMessage: text('last_error_message'),
  consecutiveErrors: integer('consecutive_errors').notNull().default(0),
});

export const oauthTokens = sqliteTable('oauth_tokens', {
  provider: text('provider').primaryKey(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: integer('expires_at'),
  scope: text('scope'),
});

export const kvSettings = sqliteTable('kv_settings', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }),
});
