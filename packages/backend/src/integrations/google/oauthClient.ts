import { eq } from 'drizzle-orm';
import { OAuth2Client, type Credentials } from 'google-auth-library';
import type { DrizzleDb } from '../../db/client.js';
import type { Env } from '../../config/env.js';
import { oauthTokens } from '../../db/schema.js';
import { NotAuthorizedError } from '../../util/errors.js';

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/tasks',
];

export function googleRedirectUri(env: Env): string {
  return `http://127.0.0.1:${env.GOOGLE_OAUTH_REDIRECT_PORT}/oauth/callback`;
}

export function createOAuthClient(env: Env, redirectUri: string): OAuth2Client {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set in packages/backend/.env');
  }
  return new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, redirectUri);
}

export async function persistGoogleTokens(db: DrizzleDb, tokens: Credentials): Promise<void> {
  const existing = db.select().from(oauthTokens).where(eq(oauthTokens.provider, 'google')).get();

  const values = {
    provider: 'google',
    accessToken: tokens.access_token ?? existing?.accessToken ?? null,
    refreshToken: tokens.refresh_token ?? existing?.refreshToken ?? null,
    expiresAt: tokens.expiry_date ?? existing?.expiresAt ?? null,
    scope: tokens.scope ?? existing?.scope ?? null,
  };

  if (existing) {
    db.update(oauthTokens).set(values).where(eq(oauthTokens.provider, 'google')).run();
  } else {
    db.insert(oauthTokens).values(values).run();
  }
}

export async function getStoredGoogleClient(db: DrizzleDb, env: Env): Promise<OAuth2Client> {
  const row = db.select().from(oauthTokens).where(eq(oauthTokens.provider, 'google')).get();
  if (!row?.refreshToken) {
    throw new NotAuthorizedError('Google account not connected yet — visit GET /api/auth/google/start');
  }

  const client = createOAuthClient(env, googleRedirectUri(env));
  client.setCredentials({
    access_token: row.accessToken ?? undefined,
    refresh_token: row.refreshToken,
    expiry_date: row.expiresAt ?? undefined,
  });

  client.on('tokens', (tokens) => {
    void persistGoogleTokens(db, tokens);
  });

  return client;
}
