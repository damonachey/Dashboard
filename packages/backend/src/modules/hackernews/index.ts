import { hackerNewsConfigSchema, type HackerNewsConfig, type HackerNewsItem, type HackerNewsModuleData } from '@dashboard/shared';
import type { ModuleDefinition } from '../types.js';

const HN_BASE = 'https://hacker-news.firebaseio.com/v0';

interface HnRawItem {
  id: number;
  title?: string;
  url?: string;
  score?: number;
  by?: string;
  descendants?: number;
}

async function fetchData(config: HackerNewsConfig): Promise<HackerNewsModuleData> {
  const topIdsRes = await fetch(`${HN_BASE}/topstories.json`);
  if (!topIdsRes.ok) {
    throw new Error(`Hacker News API error ${topIdsRes.status}`);
  }
  const topIds = (await topIdsRes.json()) as number[];
  const ids = topIds.slice(0, config.limit);

  const rawItems = await Promise.all(
    ids.map(async (id) => {
      const res = await fetch(`${HN_BASE}/item/${id}.json`);
      if (!res.ok) throw new Error(`Hacker News API error ${res.status}`);
      return (await res.json()) as HnRawItem;
    }),
  );

  const items: HackerNewsItem[] = rawItems
    .filter((item) => Boolean(item?.title))
    .map((item) => ({
      id: item.id,
      title: item.title ?? '',
      url: item.url ?? null,
      score: item.score ?? 0,
      by: item.by ?? '',
      commentsCount: item.descendants ?? 0,
      hnUrl: `https://news.ycombinator.com/item?id=${item.id}`,
    }));

  return { items };
}

export const hackerNewsModule: ModuleDefinition<HackerNewsConfig, HackerNewsModuleData> = {
  meta: {
    id: 'hacker-news',
    displayName: 'Hacker News',
    kind: 'api',
    defaultPollIntervalMs: 10 * 60 * 1000,
  },
  configSchema: hackerNewsConfigSchema,
  fetchData,
};
