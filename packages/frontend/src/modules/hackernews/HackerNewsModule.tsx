import type { HackerNewsModuleData } from '@dashboard/shared';
import type { ModuleDisplayProps } from '../registry';

export function HackerNewsModule({ envelope }: ModuleDisplayProps<unknown, HackerNewsModuleData>) {
  const items = envelope?.data?.items ?? [];

  if (items.length === 0) {
    return <p className="text-sm text-slate-400">No stories loaded yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 overflow-y-auto">
      {items.map((item) => (
        <li key={item.id} className="border-b border-slate-800 pb-2 last:border-0">
          <a
            href={item.url ?? item.hnUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-slate-100 hover:text-sky-400"
          >
            {item.title}
          </a>
          <div className="text-xs text-slate-500">
            {item.score} pts by {item.by} ·{' '}
            <a href={item.hnUrl} target="_blank" rel="noreferrer" className="hover:text-sky-400">
              {item.commentsCount} comments
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
