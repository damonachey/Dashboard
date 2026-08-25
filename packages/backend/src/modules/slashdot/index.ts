import { XMLParser } from 'fast-xml-parser';
import { slashdotConfigSchema, type SlashdotConfig, type SlashdotItem, type SlashdotModuleData } from '@dashboard/shared';
import type { ModuleDefinition } from '../types.js';
import { RateLimitedError } from '../../util/errors.js';

const FEED_URL = 'https://rss.slashdot.org/Slashdot/slashdotMain';

interface RawItem {
  title?: string;
  link?: string;
  'slash:section'?: string;
  'dc:creator'?: string;
  'dc:date'?: string;
}

async function fetchData(config: SlashdotConfig): Promise<SlashdotModuleData> {
  const res = await fetch(FEED_URL, { headers: { 'User-Agent': 'dashboard-app' } });

  if (res.status === 429) {
    throw new RateLimitedError('Slashdot RSS rate limited (429)', 15 * 60 * 1000);
  }
  if (!res.ok) {
    throw new Error(`Slashdot RSS error ${res.status}`);
  }

  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: true });
  const parsed = parser.parse(xml) as { 'rdf:RDF'?: { item?: RawItem | RawItem[] } };

  const rawItems = parsed['rdf:RDF']?.item;
  const itemList = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  const items: SlashdotItem[] = itemList.slice(0, config.limit).map((item) => ({
    title: item.title ?? '(untitled)',
    url: item.link ?? '',
    section: item['slash:section'] ?? null,
    creator: item['dc:creator'] ?? null,
    publishedAt: item['dc:date'] ?? null,
  }));

  return { items };
}

export const slashdotModule: ModuleDefinition<SlashdotConfig, SlashdotModuleData> = {
  meta: {
    id: 'slashdot',
    displayName: 'Slashdot',
    kind: 'api',
    defaultPollIntervalMs: 15 * 60 * 1000,
  },
  configSchema: slashdotConfigSchema,
  fetchData,
};
