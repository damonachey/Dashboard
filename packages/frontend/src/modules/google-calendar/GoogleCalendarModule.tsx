import type { GoogleCalendarModuleData } from '@dashboard/shared';
import type { ModuleDisplayProps } from '../registry';
import { HighlightableListItem } from '../../components/HighlightableListItem';

function formatWhen(start: string, allDay: boolean): string {
  const date = new Date(start);
  if (allDay) {
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function GoogleCalendarModule({
  envelope,
  highlightedItemId,
}: ModuleDisplayProps<unknown, GoogleCalendarModuleData>) {
  const events = envelope?.data?.events ?? [];

  if (events.length === 0) {
    return <p className="text-sm text-slate-400">No upcoming events.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 overflow-y-auto">
      {events.map((event) => (
        <HighlightableListItem
          key={event.id}
          active={event.id === highlightedItemId}
          className="border-b border-slate-800 pb-2 last:border-0"
        >
          {event.htmlLink ? (
            <a
              href={event.htmlLink}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-slate-100 hover:text-sky-400"
            >
              {event.title}
            </a>
          ) : (
            <div className="text-sm font-medium text-slate-100">{event.title}</div>
          )}
          <div className="text-xs text-slate-500">
            {formatWhen(event.start, event.allDay)}
            {event.location && ` · ${event.location}`}
          </div>
        </HighlightableListItem>
      ))}
    </ul>
  );
}
