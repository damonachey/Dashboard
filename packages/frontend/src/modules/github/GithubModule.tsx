import type { GithubModuleData } from '@dashboard/shared';
import type { ModuleDisplayProps } from '../registry';

export function GithubModule({ envelope }: ModuleDisplayProps<unknown, GithubModuleData>) {
  const notifications = envelope?.data?.notifications ?? [];

  if (notifications.length === 0) {
    return <p className="text-sm text-slate-400">No unread notifications.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 overflow-y-auto">
      {notifications.map((n) => (
        <li key={n.id} className="border-b border-slate-800 pb-2 last:border-0">
          <a
            href={n.url || undefined}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-slate-100 hover:text-sky-400"
          >
            {n.title}
          </a>
          <div className="text-xs text-slate-500">
            {n.repo} · {n.reason}
          </div>
        </li>
      ))}
    </ul>
  );
}
