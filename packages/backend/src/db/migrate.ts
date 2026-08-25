import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './client.js';

export function runMigrations(): void {
  migrate(db, { migrationsFolder: './drizzle' });
}
