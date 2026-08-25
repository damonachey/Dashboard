import { google, type gmail_v1 } from 'googleapis';
import { gmailConfigSchema, type GmailConfig, type GmailMessageItem, type GmailModuleData } from '@dashboard/shared';
import type { ModuleDefinition, PollContext } from '../types.js';
import { RateLimitedError } from '../../util/errors.js';

function headerValue(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, name: string): string {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? '';
}

async function fetchData(config: GmailConfig, ctx: PollContext): Promise<GmailModuleData> {
  const auth = await ctx.getGoogleClient();
  const gmail = google.gmail({ version: 'v1', auth });

  let listRes;
  try {
    listRes = await gmail.users.messages.list({
      userId: 'me',
      q: config.query,
      maxResults: config.maxResults,
    });
  } catch (err) {
    const status = (err as { code?: number }).code;
    if (status === 429 || status === 403) {
      throw new RateLimitedError(`Gmail API rate limited (${status})`, 5 * 60 * 1000);
    }
    throw err;
  }

  const ids = listRes.data.messages ?? [];

  const messages: GmailMessageItem[] = await Promise.all(
    ids.map(async (ref) => {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: ref.id ?? '',
        format: 'metadata',
        metadataHeaders: ['Subject', 'From'],
      });

      const headers = detail.data.payload?.headers;
      const internalDate = detail.data.internalDate;

      return {
        id: detail.data.id ?? ref.id ?? '',
        threadId: detail.data.threadId ?? ref.threadId ?? '',
        subject: headerValue(headers, 'Subject') || '(no subject)',
        from: headerValue(headers, 'From'),
        snippet: detail.data.snippet ?? '',
        receivedAt: internalDate ? new Date(Number(internalDate)).toISOString() : null,
        unread: detail.data.labelIds?.includes('UNREAD') ?? false,
      };
    }),
  );

  return {
    unreadCount: listRes.data.resultSizeEstimate ?? messages.length,
    messages,
  };
}

export const gmailModule: ModuleDefinition<GmailConfig, GmailModuleData> = {
  meta: {
    id: 'gmail',
    displayName: 'Gmail',
    kind: 'api',
    defaultPollIntervalMs: 5 * 60 * 1000,
  },
  configSchema: gmailConfigSchema,
  fetchData,
};
