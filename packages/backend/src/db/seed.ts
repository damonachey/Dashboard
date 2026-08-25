import { randomUUID } from 'node:crypto';
import { db } from './client.js';
import { tabs, moduleInstances, moduleData } from './schema.js';

const SEED_MODULES = [
  { moduleTypeId: 'github-notifications', config: { scope: 'notifications' } },
  { moduleTypeId: 'hacker-news', config: { limit: 15 } },
  { moduleTypeId: 'google-calendar', config: { calendarId: 'primary', lookaheadDays: 7 } },
  // Placeholder target — edit this instance's config to point at whatever you actually
  // want embedded, e.g. your FreshRSS reader. Many sites (including news.ycombinator.com)
  // block framing; that's what the "Open in new tab" fallback and link mode are for.
  { moduleTypeId: 'embed', config: { url: 'https://achey.net', mode: 'iframe' } },
] as const;

export function seedIfEmpty(): void {
  const existingTabs = db.select().from(tabs).all();
  if (existingTabs.length > 0) return;

  const now = new Date().toISOString();
  const homeTab = { id: randomUUID(), name: 'Home', position: 0, createdAt: now };
  db.insert(tabs).values(homeTab).run();

  SEED_MODULES.forEach((seed, index) => {
    const instance = {
      id: randomUUID(),
      tabId: homeTab.id,
      moduleTypeId: seed.moduleTypeId,
      position: index,
      config: seed.config,
      createdAt: now,
    };
    db.insert(moduleInstances).values(instance).run();

    if (seed.moduleTypeId !== 'embed') {
      db.insert(moduleData)
        .values({
          moduleInstanceId: instance.id,
          status: 'pending',
          data: null,
          lastFetchedAt: null,
          lastErrorAt: null,
          lastErrorMessage: null,
          consecutiveErrors: 0,
        })
        .run();
    }
  });
}
