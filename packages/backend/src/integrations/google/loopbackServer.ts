import http from 'node:http';

const CALLBACK_TIMEOUT_MS = 5 * 60 * 1000;

export function waitForOAuthCode(port: number): Promise<string> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      server.close();
      reject(new Error(`Timed out after ${CALLBACK_TIMEOUT_MS / 1000}s waiting for the Google OAuth callback`));
    }, CALLBACK_TIMEOUT_MS);

    const server = http.createServer((req, res) => {
      if (!req.url) return;
      const url = new URL(req.url, `http://127.0.0.1:${port}`);
      if (url.pathname !== '/oauth/callback') {
        res.writeHead(404).end();
        return;
      }

      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(
        error
          ? `<h1>Authorization failed</h1><p>${error}</p><p>You can close this tab.</p>`
          : '<h1>Google account connected</h1><p>You can close this tab and return to the dashboard.</p>',
      );

      if (settled) return;
      settled = true;
      clearTimeout(timer);
      server.close();
      if (error || !code) {
        reject(new Error(error ?? 'No authorization code returned'));
      } else {
        resolve(code);
      }
    });

    // A bind failure (e.g. a still-open server from a prior, never-completed attempt)
    // would otherwise be an unhandled 'error' event and crash the whole process.
    server.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(err);
    });

    server.listen(port);
  });
}
