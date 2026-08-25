import {
  githubReposConfigSchema,
  type GithubReposConfig,
  type GithubReposModuleData,
  type GithubRepoItem,
} from '@dashboard/shared';
import type { ModuleDefinition, PollContext } from '../types.js';
import { RateLimitedError } from '../../util/errors.js';

interface GithubRepoRaw {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  private: boolean;
  stargazers_count: number;
  language: string | null;
  open_issues_count: number;
  pushed_at: string | null;
}

async function fetchData(config: GithubReposConfig, ctx: PollContext): Promise<GithubReposModuleData> {
  const token = ctx.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN not set in packages/backend/.env');
  }

  // GitHub's "starred" endpoint only supports sort=created|updated (no pushed/full_name).
  const starredSort = config.sort === 'created' ? 'created' : 'updated';
  const url =
    config.scope === 'starred'
      ? `https://api.github.com/user/starred?sort=${starredSort}&per_page=${config.limit}`
      : `https://api.github.com/user/repos?sort=${config.sort}&per_page=${config.limit}&affiliation=owner`;

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

  const raw = (await res.json()) as GithubRepoRaw[];

  const repos: GithubRepoItem[] = raw.map((repo) => ({
    id: repo.id,
    fullName: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    private: repo.private,
    stars: repo.stargazers_count,
    language: repo.language,
    openIssues: repo.open_issues_count,
    pushedAt: repo.pushed_at,
  }));

  return { repos };
}

export const githubReposModule: ModuleDefinition<GithubReposConfig, GithubReposModuleData> = {
  meta: {
    id: 'github-repos',
    displayName: 'GitHub Repos',
    kind: 'api',
    defaultPollIntervalMs: 15 * 60 * 1000,
  },
  configSchema: githubReposConfigSchema,
  fetchData,
};
