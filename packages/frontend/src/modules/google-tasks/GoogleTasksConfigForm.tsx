import { googleTasksDateFilterOptions, type GoogleTasksConfig, type GoogleTasksDateFilter } from '@dashboard/shared';
import type { ModuleConfigFormProps } from '../registry';

const LABELS: Record<GoogleTasksDateFilter, string> = {
  past: 'Past (overdue)',
  today: 'Today',
  tomorrow: 'Tomorrow',
  next7Days: 'Next 7 days',
  next30Days: 'Next 30 days',
  all: 'All (no date filter)',
};

export function GoogleTasksConfigForm({ value, onChange }: ModuleConfigFormProps<GoogleTasksConfig>) {
  const selected = new Set(value.dateFilters);

  function toggle(filter: GoogleTasksDateFilter): void {
    let next: GoogleTasksDateFilter[];
    if (filter === 'all') {
      next = selected.has('all') ? [] : ['all'];
    } else {
      const withoutAll = value.dateFilters.filter((f) => f !== 'all');
      next = withoutAll.includes(filter) ? withoutAll.filter((f) => f !== filter) : [...withoutAll, filter];
    }
    if (next.length === 0) next = ['all'];
    onChange({ ...value, dateFilters: next });
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-slate-300">Show tasks due:</span>
      {googleTasksDateFilterOptions.map((filter) => (
        <label key={filter} className="flex items-center gap-2 text-sm text-slate-200">
          <input type="checkbox" checked={selected.has(filter)} onChange={() => toggle(filter)} />
          {LABELS[filter]}
        </label>
      ))}
    </div>
  );
}
