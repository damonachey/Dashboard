import { createHash } from 'node:crypto';
import { freshRssConfigSchema, type FreshRssConfig, type FreshRssItem, type FreshRssModuleData } from '@dashboard/shared';
import type { ModuleDefinition, PollContext } from '../types.js';
import { RateLimitedError } from '../../util/errors.js';

interface FeverBaseResponse {
  api_version: number;
  auth: 0 | 1;
}

interface FeverUnreadResponse extends FeverBaseResponse {
  unread_item_ids?: string;
}

interface FeverItemRaw {
  id: number | string;
  feed_id: number;
  title: string;
  author: string | null;
  url: string;
  created_on_time: number;
}

interface FeverItemsResponse extends FeverBaseResponse {
  items?: FeverItemRaw[];
}

interface FeverFeedRaw {
  id: number;
  title: string;
}

interface FeverFeedsResponse extends FeverBaseResponse {
  feeds?: FeverFeedRaw[];
}

function apiKey(username: string, password: string): string {
  return createHash('md5').update(`${username}:${password}`).digest('hex');
}

async function feverRequest<T extends FeverBaseResponse>(
  baseUrl: string,
  key: string,
  query: string,
): Promise<T> {
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/fever.php?api&${query}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `api_key=${encodeURIComponent(key)}`,
  });

  if (res.status === 429) {
    throw new RateLimitedError('FreshRSS rate limited (429)', 5 * 60 * 1000);
  }
  if (!res.ok) {
    throw new Error(`FreshRSS API error ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as T;
  if (json.auth !== 1) {
    throw new Error('FreshRSS API authentication failed — check FRESHRSS_USERNAME/FRESHRSS_API_PASSWORD');
  }
  return json;
}

async function fetchData(config: FreshRssConfig, ctx: PollContext): Promise<FreshRssModuleData> {
  const { FRESHRSS_BASE_URL, FRESHRSS_USERNAME, FRESHRSS_API_PASSWORD } = ctx.env;
  if (!FRESHRSS_BASE_URL || !FRESHRSS_USERNAME || !FRESHRSS_API_PASSWORD) {
    throw new Error('FRESHRSS_BASE_URL / FRESHRSS_USERNAME / FRESHRSS_API_PASSWORD not set in packages/backend/.env');
  }

  const key = apiKey(FRESHRSS_USERNAME, FRESHRSS_API_PASSWORD);

  const unreadRes = await feverRequest<FeverUnreadResponse>(FRESHRSS_BASE_URL, key, 'unread_item_ids');
  const allUnreadIds = (unreadRes.unread_item_ids ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (allUnreadIds.length === 0) {
    return { items: [] };
  }

  // IDs are roughly chronological — take the most recent ones.
  const recentIds = allUnreadIds.slice(-config.limit);

  const [itemsRes, feedsRes] = await Promise.all([
    feverRequest<FeverItemsResponse>(FRESHRSS_BASE_URL, key, `items&with_ids=${recentIds.join(',')}`),
    feverRequest<FeverFeedsResponse>(FRESHRSS_BASE_URL, key, 'feeds'),
  ]);

  const feedTitleById = new Map((feedsRes.feeds ?? []).map((feed) => [feed.id, feed.title]));

  const items: FreshRssItem[] = (itemsRes.items ?? [])
    .map((item) => ({
      id: String(item.id),
      title: item.title || '(untitled)',
      author: item.author || null,
      url: item.url,
      feedTitle: feedTitleById.get(item.feed_id) ?? null,
      publishedAt: item.created_on_time ? new Date(item.created_on_time * 1000).toISOString() : null,
    }))
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));

  return { items };
}

export const freshRssModule: ModuleDefinition<FreshRssConfig, FreshRssModuleData> = {
  meta: {
    id: 'freshrss',
    displayName: 'FreshRSS',
    kind: 'api',
    defaultPollIntervalMs: 15 * 60 * 1000,
  },
  configSchema: freshRssConfigSchema,
  fetchData,
};
