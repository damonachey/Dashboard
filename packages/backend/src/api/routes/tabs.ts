import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { eq, asc } from 'drizzle-orm';
import { createTabSchema, patchTabSchema, type TabWithModules } from '@dashboard/shared';
import { db } from '../../db/client.js';
import { tabs, moduleInstances } from '../../db/schema.js';
import { scheduler } from '../../scheduler/instance.js';

export const tabsRouter = Router();

tabsRouter.get('/', (_req, res) => {
  const allTabs = db.select().from(tabs).orderBy(asc(tabs.position)).all();
  const allModules = db.select().from(moduleInstances).orderBy(asc(moduleInstances.position)).all();

  const result: TabWithModules[] = allTabs.map((tab) => ({
    ...tab,
    modules: allModules.filter((m) => m.tabId === tab.id),
  }));

  res.json(result);
});

tabsRouter.post('/', (req, res) => {
  const parsed = createTabSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(parsed.error.flatten());
    return;
  }

  const maxPosition = db
    .select()
    .from(tabs)
    .all()
    .reduce((max, t) => Math.max(max, t.position), -1);

  const tab = {
    id: randomUUID(),
    name: parsed.data.name,
    position: maxPosition + 1,
    createdAt: new Date().toISOString(),
  };
  db.insert(tabs).values(tab).run();
  res.status(201).json(tab);
});

tabsRouter.patch('/:id', (req, res) => {
  const parsed = patchTabSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(parsed.error.flatten());
    return;
  }

  db.update(tabs).set(parsed.data).where(eq(tabs.id, req.params.id)).run();
  const updated = db.select().from(tabs).where(eq(tabs.id, req.params.id)).get();
  if (!updated) {
    res.status(404).end();
    return;
  }
  res.json(updated);
});

tabsRouter.delete('/:id', (req, res) => {
  db.delete(tabs).where(eq(tabs.id, req.params.id)).run();
  scheduler.onInstancesChanged();
  res.status(204).end();
});
