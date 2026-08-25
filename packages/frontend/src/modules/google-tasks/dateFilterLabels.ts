import {
  googleTasksDateFilterOptions,
  type GoogleTasksConfig,
  type GoogleTasksDateFilter,
  type ModuleInstance,
} from '@dashboard/shared';

const DATE_FILTER_ABBREVIATIONS: Record<GoogleTasksDateFilter, string> = {
  past: '-∞',
  today: '0',
  tomorrow: '+1',
  next7Days: '+7',
  next30Days: '+30',
  all: '+∞',
};

export function formatDateFilters(filters: readonly GoogleTasksDateFilter[]): string {
  return googleTasksDateFilterOptions
    .filter((f) => filters.includes(f))
    .map((f) => DATE_FILTER_ABBREVIATIONS[f])
    .join(', ');
}

export function googleTasksTitleSuffix(instance: ModuleInstance<GoogleTasksConfig>): string | undefined {
  const filters = instance.config?.dateFilters;
  if (!filters || filters.length === 0) return undefined;
  return formatDateFilters(filters);
}
