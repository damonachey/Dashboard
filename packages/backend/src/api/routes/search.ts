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
  return getModuleDefinition(moduleTypeId)?.meta.displayName ?? moduleTypeId;
}

searchRouter.get('/', (req, res) => {
  const q = String(req.query.q ?? '')
    .trim()
    .toLowerCase();
  if (!q) {
    res.json([]);
    return;
  }

  const allTabs = db.select().from(tabs).all();
  const tabById = new Map(allTabs.map((t) => [t.id, t]));
  const dataByInstanceId = new Map(db.select().from(moduleData).all().map((d) => [d.moduleInstanceId, d]));

  const orderedInstances = db
    .select()
    .from(moduleInstances)
    .all()
    .sort((a, b) => {
      const tabPositionDiff = (tabById.get(a.tabId)?.position ?? 0) - (tabById.get(b.tabId)?.position ?? 0);
      return tabPositionDiff !== 0 ? tabPositionDiff : a.position - b.position;
    });

  const results: SearchResult[] = [];

  for (const instance of orderedInstances) {
    if (results.length >= MAX_RESULTS) break;

    const title = moduleTitle(instance.moduleTypeId, instance.config);
    const tabName = tabById.get(instance.tabId)?.name ?? '';

    if (title.toLowerCase().includes(q)) {
      results.push({
        tabId: instance.tabId,
        tabName,
        moduleInstanceId: instance.id,
        moduleTitle: title,
        matchType: 'title',
        snippet: title,
      });
      continue;
    }

    const dataRow = dataByInstanceId.get(instance.id);
    const contentMatch = dataRow?.data ? findContentMatch(dataRow.data, q) : undefined;
    if (contentMatch) {
      results.push({
        tabId: instance.tabId,
        tabName,
        moduleInstanceId: instance.id,
        moduleTitle: title,
        matchType: 'content',
        snippet: contentMatch.snippet,
        itemId: contentMatch.itemId,
      });
    }
  }

  res.json(results);
});
