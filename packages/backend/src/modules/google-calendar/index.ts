import { google, type calendar_v3 } from 'googleapis';
import {
  googleCalendarConfigSchema,
  type GoogleCalendarConfig,
  type GoogleCalendarEventItem,
  type GoogleCalendarModuleData,
} from '@dashboard/shared';
import type { ModuleDefinition, PollContext } from '../types.js';

function toEventItem(event: calendar_v3.Schema$Event): GoogleCalendarEventItem | null {
  const start = event.start?.dateTime ?? event.start?.date;
  const end = event.end?.dateTime ?? event.end?.date;
  if (!event.id || !start || !end) return null;

  return {
    id: event.id,
    title: event.summary ?? '(untitled event)',
    start,
    end,
    allDay: Boolean(event.start?.date),
    location: event.location ?? null,
    htmlLink: event.htmlLink ?? null,
  };
}

async function fetchData(config: GoogleCalendarConfig, ctx: PollContext): Promise<GoogleCalendarModuleData> {
  const auth = await ctx.getGoogleClient();
  const calendar = google.calendar({ version: 'v3', auth });

  const timeMin = new Date();
  const timeMax = new Date(timeMin);
  timeMax.setDate(timeMax.getDate() + config.daysAhead);

  const res = await calendar.events.list({
    calendarId: config.calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: config.maxResults,
  });

  const events = (res.data.items ?? [])
    .map(toEventItem)
    .filter((e): e is GoogleCalendarEventItem => e !== null);

  return { events };
}

export const googleCalendarModule: ModuleDefinition<GoogleCalendarConfig, GoogleCalendarModuleData> = {
  meta: {
    id: 'google-calendar',
    displayName: 'Google Calendar',
    kind: 'api',
    defaultPollIntervalMs: 5 * 60 * 1000,
  },
  configSchema: googleCalendarConfigSchema,
  fetchData,
};
