# AGENTS.md

Project conventions and context for coding agents (and humans) working in this repo.

## What this is

A personal dashboard web app: a tabbed frontend where each tab holds a configurable set of
pluggable "modules," each surfacing info from an external source (GitHub, Hacker News,
Google Tasks, embedded external sites, and more to come — Gmail, Google Calendar, FreshRSS,
subreddits, Proxmox status, filesystem watch notifications, etc.).

Single user, runs as a local background process on the developer's machine. No auth, no
deployment packaging (Docker/LXC) yet — those are deliberately out of scope for now.

## Stack

- **Monorepo:** npm workspaces (`packages/*`), ESM throughout.
- **Backend:** Node.js + TypeScript, Express 4, `better-sqlite3` + Drizzle ORM, `zod` for
  validation, `tsx` for dev.
- **Frontend:** Vite + React + TypeScript, `@tanstack/react-query` for data fetching/polling,
  Tailwind CSS v4.
- **CLI:** scaffolded only for now (`packages/cli`), no commands implemented yet.

## Repo layout

```
packages/
  shared/    @dashboard/shared   — types + zod schemas shared by backend & frontend
  backend/   @dashboard/backend  — Express API, SQLite, module connectors, scheduler
  frontend/  @dashboard/frontend — Vite + React app
  cli/       @dashboard/cli      — scaffold only
```

## Running it

```
npm install          # from repo root, installs & links all workspaces
npm run dev           # runs backend (tsx watch, :4317) and frontend (vite, :5173) together
```

Frontend dev server proxies `/api/*` to the backend.

## Secrets & config

- `packages/backend/.env` (gitignored, never commit) holds API keys/tokens:
  `GITHUB_TOKEN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. See `.env.example` at repo
  root for the full list of expected variables.
- Google OAuth uses the installed-app/loopback flow (this is a local, non-public app) —
  refresh tokens are persisted in the local SQLite DB (`packages/backend/data/`, gitignored),
  not in `.env`.
- Never commit `.env` or the sqlite data files.

## Module system

Every module has a stable `moduleTypeId` and a `kind`: `'api'` (backend polls an external
source on an interval and caches the result in SQLite; frontend polls the backend's cache),
`'embed'` (frontend renders an iframe/link to a configured URL directly, no backend
connector — used by the `embed` module's iframe/link modes, not its screenshot mode, which
is `'api'`), or `'local'` (config *is* the data — e.g. Notes, Bookmarks — no polling at all).

- New API-backed module: add a folder under `packages/backend/src/modules/<name>/`
  exporting a `ModuleDefinition` (`meta`, `configSchema`, `fetchData`), register it in
  `packages/backend/src/modules/registry.ts`, then add a matching UI component + registry
  entry in `packages/frontend/src/modules/`.
- New embed instance: no backend code needed — just configure a `url` (and `mode`) through
  the "Add module" UI, or seed one directly.

### Poll intervals

Each `'api'`-kind module sets its own `defaultPollIntervalMs` (how often the *backend* re-hits
the external source); the scheduler falls back to 5 minutes (`DEFAULT_INTERVAL_MS` in
`scheduler.ts`) if one isn't set, though every current module sets its own. Separately, the
*frontend* re-reads the backend's SQLite-cached result every 30s regardless of module type
(`POLL_INTERVAL_MS` in `useModuleData.ts`) — that's just refreshing the UI, not re-fetching
from the external source.

| Interval | Modules |
|---|---|
| 1 min | Gmail |
| 5 min | GitHub Notifications, Google Tasks, Google Calendar, Stock Quotes |
| 15 min | Embedded Site (screenshot mode), Slashdot, GitHub Repos, Stock Chart, FreshRSS, Hacker News |
| 30 min | Weather Underground |
| n/a | Notes, Bookmarks (`kind: 'local'` — nothing to poll) |

On a fetch error the scheduler backs off exponentially (`interval × 2^consecutiveErrors`,
capped at 1 hour), except a thrown `RateLimitedError` (e.g. Yahoo Finance 429s), which
retries after that error's own `retryAfterMs` instead (5 min for both stock modules).

See `C:\Users\damon\.claude\plans\i-want-to-create-tender-marshmallow.md` for the full
original design plan (module contracts, DB schema, REST API, OAuth flow) if deeper context
is ever needed — that file lives outside this repo.

## Conventions

- Keep paths platform-agnostic (e.g. `DATA_DIR` env var for the SQLite file location) —
  this may move to a Linux/Proxmox LXC later even though it runs on Windows today.
- No auth on the API/frontend yet — don't add speculative auth code; note a TODO in README
  instead if this ever needs to be exposed beyond localhost.
