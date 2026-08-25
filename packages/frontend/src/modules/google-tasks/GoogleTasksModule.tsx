import type { GoogleTasksModuleData } from '@dashboard/shared';
import type { ModuleDisplayProps } from '../registry';
import { HighlightableListItem } from '../../components/HighlightableListItem';

function formatDue(due: string | null): string | null {
  if (!due) return null;
  return new Date(due).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function GoogleTasksModule({
  envelope,
  highlightedItemId,
}: ModuleDisplayProps<unknown, GoogleTasksModuleData>) {
  const tasks = envelope?.data?.tasks ?? [];

  if (tasks.length === 0) {
    return <p className="text-sm text-slate-400">No open tasks.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 overflow-y-auto">
      {tasks.map((task) => {
        const due = formatDue(task.due);
        return (
          <HighlightableListItem
            key={task.id}
            active={task.id === highlightedItemId}
            className="border-b border-slate-800 pb-2 last:border-0"
          >
            <a
              href="https://tasks.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-slate-100 hover:text-sky-400"
            >
              {task.title}
            </a>
            {(due || task.notes) && (
              <div className="text-xs text-slate-500">
                {due}
                {due && task.notes && ' · '}
                {task.notes}
              </div>
            )}
          </HighlightableListItem>
        );
      })}
    </ul>
  );
}
