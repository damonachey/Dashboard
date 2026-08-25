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

  // Gmail's messages.list returns individual messages, not threads, so a busy conversation
  // can eat several of the maxResults slots on its own. Over-fetch raw messages, then
  // dedupe by thread down to one (the most recent) per conversation before slicing to
  // maxResults, so the requested count means distinct conversations, not raw messages.
  const rawFetchLimit = Math.min(config.maxResults * 3, 100);

  let listRes;
  try {
    listRes = await gmail.users.messages.list({
      userId: 'me',
      q: config.query,
      maxResults: rawFetchLimit,
    });
  } catch (err) {
    const status = (err as { code?: number }).code;
    if (status === 429 || status === 403) {
      throw new RateLimitedError(`Gmail API rate limited (${status})`, 5 * 60 * 1000);
    }
    throw err;
  }

  const ids = listRes.data.messages ?? [];

  const allMessages: GmailMessageItem[] = await Promise.all(
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

  allMessages.sort((a, b) => (b.receivedAt ?? '').localeCompare(a.receivedAt ?? ''));

  const seenThreadIds = new Set<string>();
  const threaded: GmailMessageItem[] = [];
  for (const message of allMessages) {
    if (seenThreadIds.has(message.threadId)) continue;
    seenThreadIds.add(message.threadId);
    threaded.push(message);
  }

  return {
    unreadCount: threaded.length,
    messages: threaded.slice(0, config.maxResults),
  };
}

export const gmailModule: ModuleDefinition<GmailConfig, GmailModuleData> = {
  meta: {
    id: 'gmail',
    displayName: 'Gmail',
    kind: 'api',
    defaultPollIntervalMs: 60 * 1000,
  },
  configSchema: gmailConfigSchema,
  fetchData,
};
