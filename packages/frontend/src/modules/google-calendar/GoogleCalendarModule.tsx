import type { GoogleCalendarModuleData } from '@dashboard/shared';
import type { ModuleDisplayProps } from '../registry';

function formatWhen(event: GoogleCalendarModuleData['events'][number]): string {
  if (event.allDay) return new Date(event.start).toLocaleDateString();
  return new Date(event.start).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function GoogleCalendarModule({ envelope }: ModuleDisplayProps<unknown, GoogleCalendarModuleData>) {
  const events = envelope?.data?.events ?? [];

  if (events.length === 0) {
    return <p className="text-sm text-slate-400">No upcoming events.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 overflow-y-auto">
      {events.map((event) => (
        <li key={event.id} className="border-b border-slate-800 pb-2 last:border-0">
          <a
            href={event.htmlLink || undefined}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-slate-100 hover:text-sky-400"
          >
            {event.summary}
          </a>
          <div className="text-xs text-slate-500">{formatWhen(event)}</div>
        </li>
      ))}
    </ul>
  );
}
