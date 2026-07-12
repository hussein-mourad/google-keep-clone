# AGENTS.md

## Project Structure

Two separate packages, not a monorepo (no workspace config):

```
frontend/   Vite + React 19 + TanStack Router (file-based routing)
backend/    Express 5 + Bun runtime + better-auth + Drizzle ORM (PostgreSQL)
```

Both use ESM (`"type": "module"`).

## Running

- **Frontend dev:** `bun dev` from `frontend/` — Vite on port 3000
- **Backend dev:** `bun dev` from `backend/` — Bun with hot reload on port 8000
- Start backend before frontend (Vite proxies via `VITE_BACKEND_URL`)

## Key Commands

| Command               | Dir         | What                                  |
| --------------------- | ----------- | ------------------------------------- |
| `bun dev`             | `frontend/` | Vite dev server (port 3000)           |
| `bun dev`             | `backend/`  | Bun hot-reload server (port 8000)     |
| `bun db:generate`     | `backend/`  | Generate Drizzle migrations           |
| `bun db:push`         | `backend/`  | Push schema to DB (dev shortcut)      |
| `bun test`            | `frontend/` | Vitest                                |
| `bun test`            | `backend/`  | Vitest                                |
| `bun check`           | `frontend/` | Biome lint+format                     |
| `bun generate-routes` | `frontend/` | Regenerate TanStack Router route tree |

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
- Schema files: `backend/src/db/schema/` — `auth.ts`, `notes.ts`, `users.ts`, `timestamps.ts`
- Migrations output: `backend/src/db/migrations/`
- `DATABASE_URL` required in `backend/.env`

## Gotchas

- Frontend runs on port **3000** (Vite), backend on port **8000** (Bun) — not the same port
- `requireAuth` middleware is applied globally after auth routes in `app.ts` — all subsequent routes are protected by default
- Notes table currently lacks a `userId` column — queries are not user-scoped (needs implementation)
- Backend tsconfig uses `"verbatimModuleSyntax": true` and `"module": "Preserve"` — type-only imports must use `import type`
- Frontend uses `tsr generate` to regenerate `routeTree.gen.ts` — run this after adding/changing route files
- Biome (not ESLint/Prettier) in frontend
- Bun runtime on backend — not Node.js (don't use Node-specific APIs without checking Bun compat)
