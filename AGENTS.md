# AGENTS.md

## Project Structure

Bun workspace monorepo orchestrated with Turborepo (`apps/*`):

```
apps/frontend/   Vite + React 19 + TanStack Router (file-based routing)
apps/backend/    Express 5 + Bun runtime + better-auth + Drizzle ORM (PostgreSQL)
```

Both use ESM (`"type": "module"`).

## Running

| Command | Dir | What |
|---|---|---|
| `bun run dev` | root | Runs both frontend + backend concurrently |
| `bun run dev:frontend` | root | Frontend only (Vite on port 3000) |
| `bun run dev:backend` | root | Backend only (Bun hot-reload on port 8000) |
| `bun run dev` | `apps/frontend/` | Vite dev server (port 3000) |
| `bun run dev` | `apps/backend/` | Bun hot-reload server (port 8000) |

Start backend before frontend (Vite proxies via `VITE_BACKEND_URL`).

## Key Commands

| Command | Dir | What |
|---|---|---|
| `bun run dev` | root | Runs both frontend + backend concurrently (Turbo) |
| `bun run dev:backend` | root | Backend only (port 8000) |
| `bun run dev:frontend` | root | Frontend only (port 3000) |
| `bun run typecheck` | root | `tsc --noEmit` in both apps (Turbo) |
| `bun run check` | root | Biome check in frontend (Turbo) |
| `bun run build` | root | Build all apps (Turbo) |
| `bun run test` | root | Vitest in both apps (Turbo) |
| `bun run db:generate` | `apps/backend/` | Generate Drizzle migrations |
| `bun run db:push` | `apps/backend/` | Push schema to DB (dev shortcut) |
| `bun run db:studio` | root | Drizzle Studio (Turbo) |
| `bun run test` | `apps/frontend/` | Vitest |
| `bun run test` | `apps/backend/` | Vitest |
| `bun run test:e2e` | root | Playwright e2e (starts backend + frontend automatically) |
| `bun run test:e2e` | `apps/frontend/` | Playwright e2e |
| `bun run test:e2e:ui` | `apps/frontend/` | Playwright UI mode |
| `bun run test:e2e:install` | `apps/frontend/` | Install Playwright browsers |
| `bun run check` | `apps/frontend/` | Biome lint+format |
| `bun run generate-routes` | `apps/frontend/` | Regenerate TanStack Router route tree |

## Path Aliases

- **Both:** `@/*` maps to `./src/*`
- **Frontend only:** `#/*` maps to `./src/*` (Node.js subpath imports — `#` in tsconfig + package.json `imports`)

## Auth

- **better-auth** with `drizzleAdapter` (PostgreSQL)
- Providers: email/password (enabled), GitHub, Google (optional OAuth)
- Session stored via cookies; `withCredentials: true` on all axios requests
- `requireAuth` middleware at `src/features/auth/middleware.ts` — attaches `req.user` and `req.session`
- All routes under `/api/auth/*` handled by `toNodeHandler(auth)` (Express 5 compatible)
- Frontend uses `better-auth/react` client at `src/lib/auth-client.ts`

## API Conventions

- Frontend axios client: `src/lib/api.ts` (default export, `baseURL` from `VITE_BACKEND_URL`)
- Backend env validated with Zod at `src/lib/env.ts` — will throw on startup if missing required vars
- Notes router: `src/features/notes/router.ts` — all routes currently protected via global `requireAuth`
- Notes controllers at `src/features/notes/controller.ts`, DB service at `src/features/notes/service.ts`

## Database

- Drizzle ORM with `node-postgres` driver
- Schema files: `apps/backend/src/db/schema/` — `auth.ts`, `notes.ts`, `users.ts`, `timestamps.ts`
- Migrations output: `apps/backend/src/db/migrations/`
- `DATABASE_URL` required in `apps/backend/.env`

## Gotchas

- Frontend runs on port **3000** (Vite), backend on port **8000** (Bun) — not the same port
- `requireAuth` middleware is applied globally after auth routes in `app.ts` — all subsequent routes are protected by default
- Notes table has a `userId` column (foreign key to `user.id` with cascade delete); all queries are user-scoped
- Backend tsconfig uses `"verbatimModuleSyntax": true` and `"module": "Preserve"` — type-only imports must use `import type`
- Frontend uses `tsr generate` to regenerate `routeTree.gen.ts` — run this after adding/changing route files
- Biome (not ESLint/Prettier) in frontend
- Bun runtime on backend — not Node.js (don't use Node-specific APIs without checking Bun compat)
- Task orchestration via Turborepo (`turbo.json`); root scripts delegate to `turbo run`. `db:push`/`db:migrate`/`db:seed` are cache-disabled (they mutate the DB)
