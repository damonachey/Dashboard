import type { GithubReposModuleData } from '@dashboard/shared';
import type { ModuleDisplayProps } from '../registry';
import { HighlightableListItem } from '../../components/HighlightableListItem';

function formatPushedAt(pushedAt: string | null): string | null {
  if (!pushedAt) return null;
  return new Date(pushedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function GithubReposModule({
  envelope,
  highlightedItemId,
}: ModuleDisplayProps<unknown, GithubReposModuleData>) {
  const repos = envelope?.data?.repos ?? [];

  if (repos.length === 0) {
    return <p className="text-sm text-slate-400">No repos found.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 overflow-y-auto">
      {repos.map((repo) => (
        <HighlightableListItem
          key={repo.id}
          active={String(repo.id) === highlightedItemId}
          className="border-b border-slate-800 pb-2 last:border-0"
        >
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-slate-100 hover:text-sky-400"
          >
            {repo.fullName}
          </a>
          {repo.private && (
            <span className="ml-1.5 rounded bg-slate-800 px-1 text-[10px] uppercase text-slate-400">private</span>
          )}
          {repo.description && <div className="truncate text-xs text-slate-500">{repo.description}</div>}
          <div className="text-xs text-slate-500">
            {[
              repo.language,
              `★ ${repo.stars}`,
              repo.openIssues > 0 ? `${repo.openIssues} open issues` : null,
              formatPushedAt(repo.pushedAt),
            ]
              .filter(Boolean)
              .join(' · ')}
          </div>
        </HighlightableListItem>
      ))}
    </ul>
  );
}
