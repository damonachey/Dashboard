import {
  githubModuleConfigSchema,
  type GithubModuleConfig,
  type GithubModuleData,
  type GithubNotificationItem,
} from '@dashboard/shared';
import type { ModuleDefinition, PollContext } from '../types.js';
import { RateLimitedError } from '../../util/errors.js';

interface GithubNotificationRaw {
  id: string;
  reason: string;
  unread: boolean;
  updated_at: string;
  subject: { title: string; type: string; url?: string };
  repository: { full_name: string };
}

interface GithubIssueRaw {
  id: number;
  title: string;
  html_url: string;
  updated_at: string;
  repository?: { full_name: string };
}

function apiUrlToWebUrl(apiUrl: string | undefined): string {
  if (!apiUrl) return '';
  return apiUrl.replace('https://api.github.com/repos/', 'https://github.com/').replace('/pulls/', '/pull/');
}

async function fetchData(config: GithubModuleConfig, ctx: PollContext): Promise<GithubModuleData> {
  const token = ctx.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN not set in packages/backend/.env');
  }

  const url =
    config.scope === 'assigned-issues'
      ? 'https://api.github.com/issues?filter=assigned&state=open'
      : 'https://api.github.com/notifications?all=false';

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'dashboard-app',
    },
  });

  if (res.status === 403 || res.status === 429) {
    const resetHeader = res.headers.get('x-ratelimit-reset');
    const retryAfterMs = resetHeader ? Math.max(1000, Number(resetHeader) * 1000 - Date.now()) : 5 * 60 * 1000;
    throw new RateLimitedError(`GitHub API rate limited (${res.status})`, retryAfterMs);
  }
  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
  }

  const notifications: GithubNotificationItem[] =
    config.scope === 'assigned-issues'
      ? ((await res.json()) as GithubIssueRaw[]).map((issue) => ({
          id: String(issue.id),
          title: issue.title,
          repo: issue.repository?.full_name ?? '',
          reason: 'assigned',
          type: 'Issue',
          url: issue.html_url,
          updatedAt: issue.updated_at,
          unread: true,
        }))
      : ((await res.json()) as GithubNotificationRaw[]).map((n) => ({
          id: n.id,
          title: n.subject?.title ?? '(no title)',
          repo: n.repository?.full_name ?? '',
          reason: n.reason,
          type: n.subject?.type ?? '',
          url: apiUrlToWebUrl(n.subject?.url),
          updatedAt: n.updated_at,
          unread: n.unread,
        }));

  return { notifications };
}

export const githubModule: ModuleDefinition<GithubModuleConfig, GithubModuleData> = {
  meta: {
    id: 'github-notifications',
    displayName: 'GitHub Notifications',
    kind: 'api',
    defaultPollIntervalMs: 5 * 60 * 1000,
  },
  configSchema: githubModuleConfigSchema,
  fetchData,
};
