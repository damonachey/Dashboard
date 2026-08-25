import { google } from 'googleapis';
import {
  googleCalendarConfigSchema,
  type GoogleCalendarConfig,
  type GoogleCalendarEventItem,
  type GoogleCalendarModuleData,
} from '@dashboard/shared';
import type { ModuleDefinition, PollContext } from '../types.js';

async function fetchData(config: GoogleCalendarConfig, ctx: PollContext): Promise<GoogleCalendarModuleData> {
  const auth = await ctx.getGoogleClient();
  const calendar = google.calendar({ version: 'v3', auth });

  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + config.lookaheadDays * 24 * 60 * 60 * 1000).toISOString();

  const res = await calendar.events.list({
    calendarId: config.calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 25,
  });

  const events: GoogleCalendarEventItem[] = (res.data.items ?? []).map((event) => ({
    id: event.id ?? '',
    summary: event.summary ?? '(no title)',
    start: event.start?.dateTime ?? event.start?.date ?? '',
    end: event.end?.dateTime ?? event.end?.date ?? '',
    allDay: !event.start?.dateTime,
    htmlLink: event.htmlLink ?? '',
  }));

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
