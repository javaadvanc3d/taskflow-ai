# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server with Turbopack (localhost:3000)
npm run build    # Production build with Turbopack
npm start        # Run production server

npm run dev               # Start dev server (localhost:3000)
npm run build             # Production build
npm test                  # Unit tests (vitest run)
npm run test:watch        # Unit tests in watch mode
npm run test:coverage     # Unit tests + v8 coverage (threshold 20%)
npm run test:e2e          # Playwright E2E tests (requires dev server)
npm run test:e2e:ui       # Playwright interactive UI
npx eslint src/ --max-warnings 0  # Lint
npx tsc --noEmit          # Type check

# Batch-embed all existing tasks (run once after DB setup or schema changes)
npx ts-node -r dotenv/config src/scripts/embed-all-tasks.ts
```

Config files: `vitest.config.ts`, `playwright.config.ts`, `eslint.config.mjs`.

## Architecture

**Stack:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Supabase + @dnd-kit

**Key integrations** (credentials in `.env.local`):
- **Supabase** — database, auth, and pgvector search via `@supabase/supabase-js` and `@supabase/ssr`
- **Anthropic** — Claude Sonnet 4.6 (`ANTHROPIC_API_KEY`)
- **Voyage AI** — `voyage-3.5` embeddings, 1024-dim halfvec (`VOYAGE_API_KEY`)
- **Groq** — LLaMA 3.3-70b as alternate inference model (`GROQ_API_KEY`)

**Path alias:** `@/*` → `./src/*`

---

## Key patterns

### Pages

- `src/app/page.tsx` — **Public demo page** (no auth required). Uses hardcoded mock tasks; `updateTaskStatus` returns early when unauthenticated so optimistic updates don't revert.
- `src/app/dashboard/page.tsx` — **Protected**. Fetches real tasks via `getTasks()`. Layout: 2/3 width Kanban board + 1/3 width AI chat sidebar. Redirects to `/login` if no session.

### Auth flow
- `middleware.ts` (root) refreshes the session token on every request via `supabase.auth.getUser()` — it does **not** redirect; individual pages call `redirect('/login')`.
- `src/lib/supabase/server.ts` — async `createClient()` using `next/headers` cookies (Server Components, Route Handlers, Server Actions).
- `src/lib/supabase/client.ts` — `createClient()` using `createBrowserClient` (Client Components).
- `signIn` / `signOut` live in `src/app/login/actions.ts` as Server Actions.

### Kanban drag-and-drop
`@dnd-kit` requires `ssr: false` to avoid hydration mismatches with its generated `aria-describedby` IDs. The layering is:

```
page.tsx (Server Component)
  └── KanbanBoardClient   ← 'use client' + dynamic(..., { ssr: false })
        └── KanbanBoard   ← composes the 3 hooks + DndContext
              └── KanbanColumn  ← useDroppable + SortableContext
                    └── SortableTaskCard  ← useSortable wrapper
                          └── TaskCard    ← pure presentational
```

`KanbanBoardClient` exists solely as the `ssr: false` boundary — `next/dynamic` with `ssr: false` is not allowed directly in Server Components.

### Hooks (`src/hooks/`)
- `useMoveTask(initialTasks)` — owns the `tasks` state + optimistic updates. Snapshots state before mutation, reverts on Server Action failure.
- `useTasksByStatus(tasks)` — `useMemo` grouping by status, sorted by `position`.
- `useKanbanDnd(tasks, moveTask)` — encapsulates sensors and drag handlers. Drop target resolution: if `over.id` is a valid `TaskStatus` → use it directly (dropped on column); otherwise find the task by that id → use its status (dropped on another card).

### Server Actions (`src/actions/tasks.ts`)
- `updateTaskStatus` — checks `getUser()` first; returns early (no throw) if unauthenticated so the demo page (`/`) works without reverting optimistic updates.
- `createTask` — inserts task then calls `embedTask()` in a non-blocking try/catch (embedding failure never breaks task creation).
- `getTasks` — filters by `user.id`, ordered by `position`.
- Both mutating actions call `revalidatePath('/dashboard')` only when needed.

### AI chat & RAG pipeline
The dashboard sidebar chat (`src/components/chat/task-chat.tsx`) is a full RAG loop:

```
user query
  → chatWithTasks()          (src/actions/chat.ts)
      → searchTasks()        (src/actions/search.ts)
          → embedQuery()     (src/lib/embeddings.ts)  ← Voyage AI
          → match_task_embeddings() RPC               ← Supabase pgvector
      → system prompt built from search results
      → Anthropic or Groq completion
  ← answer + sources[]
```

- **Search threshold:** 0.35 cosine similarity (tuned loose for recall).
- **Model toggle:** user can switch between Anthropic (default) and Groq at runtime.
- **Speech input:** Web Speech API (`es-ES` locale), Chrome only — transcript feeds the text input.
- `src/scripts/embed-all-tasks.ts` backfills embeddings in batches of 10 with a 500 ms delay between batches (Voyage AI rate limit).

### Embeddings (`src/lib/`)
- `embeddings.ts` — thin Voyage AI REST wrapper; exports `embedDocument`, `embedQuery`, `embedDocuments`.
- `embed-task.ts` — `embedTask(task)` stringifies a task to plain text, deletes the old `task_embeddings` row, inserts a new one. Uses the **service-role** Supabase client (`SUPABASE_SERVICE_ROLE_KEY`) to bypass RLS.

### Types & constants (`src/types/tasks.ts`)
Single source of truth for `TaskStatus`, `TaskPriority`, `Task`, `KANBAN_COLUMNS`, and `PRIORITY_CONFIG` (badge labels + Tailwind classes). Import from here, never redefine locally.

### DB migrations (`supabase/migrations/`)
Run in order: `001_profiles.sql` → `002_tasks.sql` → `003_rls.sql` → `004_enable_vector.sql` → `005_task_embeddings.sql` → `006_match_embeddings.sql`.
- `set_updated_at()` trigger is defined in `001` and reused in `002`.
- `006` defines the `match_task_embeddings(query_embedding, query_user_id, match_threshold, match_count)` RPC used by `search.ts`.

---

## Mandatory rules
- TypeScript strict at all times — never use `any`
- Server Components by default; `'use client'` only when necessary
- Server Actions for all mutations
- RLS enabled on all tables
- `useMemo` for expensive computations
- Error handling in every `try/catch`
- Do not delete existing `console.log` statements

## CI/CD

Pipeline defined in `.github/workflows/ci-cd.yml`:
- **CI job** — runs on every push to `main`/`develop` and on PRs to `main`: lint → type check → vitest --coverage → next build
- **deploy-production job** — runs only when CI passes on a push to `main`: `vercel pull` → `vercel build --prod` → `vercel deploy --prod`
- Vercel token secret is named `TOKEN_SERVER_AI` (not `VERCEL_TOKEN`)
- All app env vars must be set as GitHub Actions secrets (see `CONTRIBUTING.md`)

## Context management
- Run `/compact` before continuing when context grows large
- Run `/cost` at the end of each task
- Default model: Sonnet. Use Opus only for complex architecture work
