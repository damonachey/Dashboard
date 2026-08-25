import { Router } from 'express';
import { eq } from 'drizzle-orm';
import type { GoogleAuthStatus } from '@dashboard/shared';
import { db } from '../../db/client.js';
import { env } from '../../config/env.js';
import { oauthTokens } from '../../db/schema.js';
import { createOAuthClient, googleRedirectUri, persistGoogleTokens, GOOGLE_SCOPES } from '../../integrations/google/oauthClient.js';
import { waitForOAuthCode } from '../../integrations/google/loopbackServer.js';
import { logger } from '../../util/logger.js';

export const googleAuthRouter = Router();

googleAuthRouter.get('/status', (_req, res) => {
  const row = db.select().from(oauthTokens).where(eq(oauthTokens.provider, 'google')).get();
  const status: GoogleAuthStatus = { authorized: Boolean(row?.refreshToken) };
  res.json(status);
});

// Visit this directly in a browser (not via the frontend's fetch proxy) — it redirects to
// Google's consent screen, then a short-lived local loopback server catches the redirect back.
googleAuthRouter.get('/start', (req, res) => {
  let client;
  try {
    client = createOAuthClient(env, googleRedirectUri(env));
  } catch (err) {
    res.status(500).send(err instanceof Error ? err.message : String(err));
    return;
  }

  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GOOGLE_SCOPES,
  });

  const codePromise = waitForOAuthCode(env.GOOGLE_OAUTH_REDIRECT_PORT);
  res.redirect(authUrl);

  void (async () => {
    try {
      const code = await codePromise;
      const { tokens } = await client.getToken(code);
      await persistGoogleTokens(db, tokens);
      logger.info('Google account connected');
    } catch (err) {
      logger.error('Google OAuth flow failed', err);
    }
  })();
});
