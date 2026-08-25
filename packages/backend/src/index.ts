import { runMigrations } from './db/migrate.js';
import { seedIfEmpty } from './db/seed.js';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { scheduler } from './scheduler/instance.js';
import { logger } from './util/logger.js';

runMigrations();
seedIfEmpty();
scheduler.start();

const app = createApp();
app.listen(env.PORT, () => {
  logger.info(`Backend listening on http://localhost:${env.PORT}`);
});
