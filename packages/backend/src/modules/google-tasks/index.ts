import { google, type tasks_v1 } from 'googleapis';
import {
  googleTasksConfigSchema,
  type GoogleTasksConfig,
  type GoogleTaskItem,
  type GoogleTasksModuleData,
} from '@dashboard/shared';
import type { ModuleDefinition, PollContext } from '../types.js';

async function fetchData(config: GoogleTasksConfig, ctx: PollContext): Promise<GoogleTasksModuleData> {
  const auth = await ctx.getGoogleClient();
  const tasksApi = google.tasks({ version: 'v1', auth });

  const res = await tasksApi.tasks.list({
    tasklist: config.taskListId,
    showCompleted: false,
    maxResults: config.maxResults,
  });

  const tasks: GoogleTaskItem[] = (res.data.items ?? []).map((task: tasks_v1.Schema$Task) => ({
    id: task.id ?? '',
    title: task.title ?? '(untitled task)',
    notes: task.notes ?? null,
    due: task.due ?? null,
    status: task.status === 'completed' ? 'completed' : 'needsAction',
    taskListId: config.taskListId,
  }));

  return { tasks };
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
