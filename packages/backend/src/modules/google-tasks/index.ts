import { google, type tasks_v1 } from 'googleapis';
import {
  googleTasksConfigSchema,
  type GoogleTasksConfig,
  type GoogleTaskItem,
  type GoogleTasksModuleData,
  type GoogleTasksDateFilter,
} from '@dashboard/shared';
import type { ModuleDefinition, PollContext } from '../types.js';

// Google Tasks due dates are calendar dates encoded as UTC midnight (e.g.
// "2026-08-25T00:00:00.000Z" means "Aug 25", not a specific moment) — comparing that
// against a local-timezone "today" would skew by a day for anyone west of UTC. Normalize
// both sides to a UTC-midnight Date built from the relevant calendar-date components:
// the server's *local* Y/M/D for "today" (that's the user's real today, since this runs
// on their own machine), and the due date's *UTC* Y/M/D (that's the calendar date Google
// actually encoded).
function toUtcDateOnly(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

function localTodayAsUtcDateOnly(): Date {
  const now = new Date();
  return toUtcDateOnly(now.getFullYear(), now.getMonth(), now.getDate());
}

function dueDateOnly(dueIso: string): Date {
  const due = new Date(dueIso);
  return toUtcDateOnly(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());
}

function filterByDateBuckets(tasks: GoogleTaskItem[], filters: GoogleTasksDateFilter[]): GoogleTaskItem[] {
  if (filters.includes('all')) return tasks;

  const today = localTodayAsUtcDateOnly();
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(today.getUTCDate() + 1);
  const next7 = new Date(today);
  next7.setUTCDate(today.getUTCDate() + 7);
  const next30 = new Date(today);
  next30.setUTCDate(today.getUTCDate() + 30);

  return tasks.filter((task) => {
    if (!task.due) return false;
    const due = dueDateOnly(task.due);
    return filters.some((filter) => {
      switch (filter) {
        case 'past':
          return due < today;
        case 'today':
          return due.getTime() === today.getTime();
        case 'tomorrow':
          return due.getTime() === tomorrow.getTime();
        case 'next7Days':
          return due >= today && due < next7;
        case 'next30Days':
          return due >= today && due < next30;
        default:
          return false;
      }
    });
  });
}

async function fetchData(config: GoogleTasksConfig, ctx: PollContext): Promise<GoogleTasksModuleData> {
  const auth = await ctx.getGoogleClient();
  const tasksApi = google.tasks({ version: 'v1', auth });

  // Fetch the API's max page size regardless of maxResults — Tasks API's default
  // ordering isn't by due date, so filtering after a smaller fetch could miss tasks
  // that would otherwise match a date bucket. maxResults trims the result afterward.
  const res = await tasksApi.tasks.list({
    tasklist: config.taskListId,
    showCompleted: false,
    maxResults: 100,
  });

  const allTasks: GoogleTaskItem[] = (res.data.items ?? []).map((task: tasks_v1.Schema$Task) => ({
    id: task.id ?? '',
    title: task.title ?? '(untitled task)',
    notes: task.notes ?? null,
    due: task.due ?? null,
    status: task.status === 'completed' ? 'completed' : 'needsAction',
    taskListId: config.taskListId,
  }));

  const filtered = filterByDateBuckets(allTasks, config.dateFilters);
  filtered.sort((a, b) => {
    if (!a.due && !b.due) return 0;
    if (!a.due) return 1;
    if (!b.due) return -1;
    return a.due.localeCompare(b.due);
  });

  return { tasks: filtered.slice(0, config.maxResults) };
}

export const googleTasksModule: ModuleDefinition<GoogleTasksConfig, GoogleTasksModuleData> = {
  meta: {
    id: 'google-tasks',
    displayName: 'Google Tasks',
    kind: 'api',
    defaultPollIntervalMs: 5 * 60 * 1000,
  },
  configSchema: googleTasksConfigSchema,
  fetchData,
};
