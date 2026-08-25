import type { SlashdotModuleData } from '@dashboard/shared';
import type { ModuleDisplayProps } from '../registry';
import { HighlightableListItem } from '../../components/HighlightableListItem';

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

export function SlashdotModule({ envelope, highlightedItemId }: ModuleDisplayProps<unknown, SlashdotModuleData>) {
  const items = envelope?.data?.items ?? [];

  if (items.length === 0) {
    return <p className="text-sm text-slate-400">No stories loaded yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 overflow-y-auto">
      {items.map((item) => (
        <HighlightableListItem
          key={item.url}
          active={item.url === highlightedItemId}
          className="border-b border-slate-800 pb-2 last:border-0"
        >
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-slate-100 hover:text-sky-400"
          >
            {item.title}
          </a>
          <div className="text-xs text-slate-500">
            {[item.section, item.creator, formatWhen(item.publishedAt)].filter(Boolean).join(' · ')}
          </div>
        </HighlightableListItem>
      ))}
    </ul>
  );
}
