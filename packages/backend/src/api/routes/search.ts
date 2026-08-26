import { Router } from 'express';
import type { SearchResult } from '@dashboard/shared';
import { db } from '../../db/client.js';
import { tabs, moduleInstances, moduleData } from '../../db/schema.js';
import { getModuleDefinition } from '../../modules/registry.js';

export const searchRouter = Router();

const MAX_RESULTS = 20;

function collectStrings(value: unknown, out: string[]): void {
  if (typeof value === 'string') {
    if (value.trim()) out.push(value);
  } else if (Array.isArray(value)) {
    for (const v of value) collectStrings(v, out);
  } else if (value && typeof value === 'object') {
    for (const v of Object.values(value)) collectStrings(v, out);
  }
}

// Every module's data shape is `{ <someKey>: Item[] }` (tasks, messages, notifications,
// items, repos). Walk each array-valued property and check each item's own strings, so a
// content match can point at the specific item (by id, falling back to url) rather than
// just the module as a whole.
function findContentMatch(data: unknown, q: string): { itemId: string; snippet: string } | undefined {
  if (!data || typeof data !== 'object') return undefined;

  for (const value of Object.values(data)) {
    if (!Array.isArray(value)) continue;

    for (const item of value) {
      if (!item || typeof item !== 'object') continue;

      const strings: string[] = [];
      collectStrings(item, strings);
      const match = strings.find((s) => s.toLowerCase().includes(q));
      if (!match) continue;

      const record = item as Record<string, unknown>;
      const idValue = record.id ?? record.url;
      if (idValue === undefined || idValue === null) continue;

      return { itemId: String(idValue), snippet: match };
    }
  }

  return undefined;
}

function moduleTitle(moduleTypeId: string, config: unknown): string {
  if (moduleTypeId === 'embed' && config && typeof config === 'object' && 'url' in config) {
    const url = (config as { url?: unknown }).url;
    if (typeof url === 'string') {
      try {
        return new URL(url).hostname;
      } catch {
        // fall through to the generic display name below
      }
    }
  }
  if (
    (moduleTypeId === 'notes' || moduleTypeId === 'weather') &&
    config &&
    typeof config === 'object' &&
    'title' in config
  ) {
    const title = (config as { title?: unknown }).title;
    if (typeof title === 'string' && title.trim()) return title;
  }
  return getModuleDefinition(moduleTypeId)?.meta.displayName ?? moduleTypeId;
}

// Notes store their content as freeform text in the instance's own config rather than in
// polled moduleData, and aren't a list of separately-clickable items, so they can't go
// through findContentMatch — find the match here and return a short excerpt around it.
function findNotesTextMatch(config: unknown, q: string): { snippet: string } | undefined {
  if (!config || typeof config !== 'object' || !('text' in config)) return undefined;
  const text = (config as { text?: unknown }).text;
  if (typeof text !== 'string') return undefined;

  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return undefined;

  const start = Math.max(0, idx - 20);
  const end = Math.min(text.length, idx + q.length + 40);
  const snippet = `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
  return { snippet };
}

searchRouter.get('/', (req, res) => {
  const q = String(req.query.q ?? '')
    .trim()
    .toLowerCase();
  if (!q) {
    res.json([]);
    return;
  }

  const orderedTabs = db
    .select()
    .from(tabs)
    .all()
    .sort((a, b) => a.position - b.position);

  const instancesByTabId = new Map<string, (typeof moduleInstances.$inferSelect)[]>();
  for (const instance of db.select().from(moduleInstances).all()) {
    const list = instancesByTabId.get(instance.tabId) ?? [];
    list.push(instance);
    instancesByTabId.set(instance.tabId, list);
  }
  for (const list of instancesByTabId.values()) list.sort((a, b) => a.position - b.position);

  const dataByInstanceId = new Map(db.select().from(moduleData).all().map((d) => [d.moduleInstanceId, d]));

  const results: SearchResult[] = [];

  for (const tab of orderedTabs) {
    if (results.length >= MAX_RESULTS) break;

    if (tab.name.toLowerCase().includes(q)) {
      results.push({
        tabId: tab.id,
        tabName: tab.name,
        matchType: 'tab',
        snippet: tab.name,
      });
    }

    for (const instance of instancesByTabId.get(tab.id) ?? []) {
      if (results.length >= MAX_RESULTS) break;

      const title = moduleTitle(instance.moduleTypeId, instance.config);

      if (title.toLowerCase().includes(q)) {
        results.push({
          tabId: tab.id,
          tabName: tab.name,
          moduleInstanceId: instance.id,
          moduleTitle: title,
          matchType: 'title',
          snippet: title,
        });
        continue;
      }

      if (instance.moduleTypeId === 'notes') {
        const notesMatch = findNotesTextMatch(instance.config, q);
        if (notesMatch) {
          results.push({
            tabId: tab.id,
            tabName: tab.name,
            moduleInstanceId: instance.id,
            moduleTitle: title,
            matchType: 'content',
            snippet: notesMatch.snippet,
          });
        }
        continue;
      }

      const dataRow = dataByInstanceId.get(instance.id);
      const contentMatch = dataRow?.data ? findContentMatch(dataRow.data, q) : undefined;
      if (contentMatch) {
        results.push({
          tabId: tab.id,
          tabName: tab.name,
          moduleInstanceId: instance.id,
          moduleTitle: title,
          matchType: 'content',
          snippet: contentMatch.snippet,
          itemId: contentMatch.itemId,
        });
      }
    }
  }

  res.json(results);
});
