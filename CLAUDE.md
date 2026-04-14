# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server with Turbopack (localhost:3000)
npm run build    # Production build with Turbopack
npm start        # Run production server
```

No test runner or linter is configured yet.

## Architecture

**Stack:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Supabase

**Key integrations** (credentials in `.env.local`):
- **Supabase** — database and auth via `@supabase/supabase-js` and `@supabase/ssr`
- **Anthropic** — Claude API (`ANTHROPIC_API_KEY`)
- **Voyage AI** — embeddings via `voyageai` package (`VOYAGE_API_KEY`)
- **Groq** — alternative inference (`GROQ_API_KEY`)

**Source layout:** `src/app/` uses Next.js App Router conventions. Path alias `@/*` resolves to `./src/*`.

Supabase server-side helpers live in `@supabase/ssr` — use its `createServerClient` / `createBrowserClient` helpers rather than the base `createClient` to correctly handle cookies in Server Components and Route Handlers.
