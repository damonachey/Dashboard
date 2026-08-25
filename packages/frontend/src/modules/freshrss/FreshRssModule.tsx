import type { FreshRssModuleData } from '@dashboard/shared';
import type { ModuleDisplayProps } from '../registry';

function formatWhen(publishedAt: string | null): string | null {
  if (!publishedAt) return null;
  return new Date(publishedAt).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function FreshRssModule({ envelope }: ModuleDisplayProps<unknown, FreshRssModuleData>) {
  const items = envelope?.data?.items ?? [];

  if (items.length === 0) {
    return <p className="text-sm text-slate-400">No unread items.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 overflow-y-auto">
      {items.map((item) => (
        <li key={item.id} className="border-b border-slate-800 pb-2 last:border-0">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-slate-100 hover:text-sky-400"
          >
            {item.title}
          </a>
          <div className="text-xs text-slate-500">
            {[item.feedTitle, item.author, formatWhen(item.publishedAt)].filter(Boolean).join(' · ')}
          </div>
        </li>
      ))}
    </ul>
  );
}
