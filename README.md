# Dashboard

A personal, single-user dashboard: a tabbed web app where each tab holds a configurable
set of pluggable modules, each surfacing info from an external source.

Runs as a local background process on your own machine — no auth, no deployment packaging.

## Modules

- GitHub Notifications
- GitHub Repos
- Gmail
- Google Tasks
- Google Calendar
- FreshRSS
- Hacker News
- Slashdot
- Stock Quotes
- Stock Chart
- Weather Underground
- Embedded Site (iframe, link, or screenshot)
- Notes
- Bookmarks

Each module is either:

- **`api`** — the backend polls an external source on an interval and caches the result in
  SQLite; the frontend polls the backend's cache every 30s.
- **`embed`** — the frontend renders an iframe/link to a configured URL directly.
- **`local`** — the config *is* the data (e.g. Notes, Bookmarks); nothing is polled.

## Stack

- **Monorepo:** npm workspaces (`packages/*`), ESM throughout.
- **Backend:** Node.js + TypeScript, Express 4, `better-sqlite3` + Drizzle ORM, `zod`,
  `tsx` for dev.
- **Frontend:** Vite + React + TypeScript, TanStack Query, Tailwind CSS v4.
- **CLI:** scaffolded only, no commands implemented yet.

## Repo layout

```
packages/
  shared/    @dashboard/shared   — types + zod schemas shared by backend & frontend
  backend/   @dashboard/backend  — Express API, SQLite, module connectors, scheduler
  frontend/  @dashboard/frontend — Vite + React app
  cli/       @dashboard/cli      — scaffold only
```

## Getting started

```
npm install
npm run dev
```

This runs the backend (`tsx watch`, `:4317`) and frontend (Vite, `:5173`) together. The
frontend dev server proxies `/api/*` to the backend.

### Configuration

Copy the variables you need from `.env.example` into `packages/backend/.env` (gitignored,
never commit it):

- `GITHUB_TOKEN` — GitHub personal access token
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth client ("Desktop app" type)
- `GOOGLE_OAUTH_REDIRECT_PORT` — loopback port used during the one-time OAuth consent flow
- `FRESHRSS_BASE_URL` / `FRESHRSS_USERNAME` / `FRESHRSS_API_PASSWORD` — FreshRSS Fever API
- `PORT` — backend HTTP port
- `DATA_DIR` — where the SQLite DB file lives

Google OAuth uses the installed-app/loopback flow; refresh tokens are persisted in the
local SQLite DB (`packages/backend/data/`, gitignored), not in `.env`.

## License

GPL-3.0 — see [LICENSE](LICENSE).
