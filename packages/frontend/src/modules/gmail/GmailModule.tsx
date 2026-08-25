import type { GmailModuleData } from '@dashboard/shared';
import type { ModuleDisplayProps } from '../registry';

function formatWhen(receivedAt: string | null): string | null {
  if (!receivedAt) return null;
  return new Date(receivedAt).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function fromName(from: string): string {
  // "Some Name <someone@example.com>" -> "Some Name"; fall back to the raw value.
  const match = from.match(/^"?([^"<]+?)"?\s*<.*>$/);
  return match ? match[1] : from;
}

export function GmailModule({ envelope }: ModuleDisplayProps<unknown, GmailModuleData>) {
  const data = envelope?.data;
  const messages = data?.messages ?? [];

  if (messages.length === 0) {
    return <p className="text-sm text-slate-400">No messages.</p>;
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="text-xs text-slate-500">{data?.unreadCount ?? messages.length} matching</div>
      <ul className="flex flex-col gap-2 overflow-y-auto">
        {messages.map((message) => (
          <li key={message.id} className="border-b border-slate-800 pb-2 last:border-0">
            <a
              href={`https://mail.google.com/mail/u/0/#all/${message.id}`}
              target="_blank"
              rel="noreferrer"
              className={`text-sm hover:text-sky-400 ${
                message.unread ? 'font-semibold text-slate-100' : 'font-normal text-slate-300'
              }`}
            >
              {message.subject}
            </a>
            <div className="truncate text-xs text-slate-500">
              {fromName(message.from)}
              {formatWhen(message.receivedAt) && ` · ${formatWhen(message.receivedAt)}`}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
