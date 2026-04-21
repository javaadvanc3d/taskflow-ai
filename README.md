# TaskFlow AI

AI-powered Kanban board with semantic task search and a conversational assistant.

[![CI](https://github.com/YOUR_GITHUB_USER/taskflow-ai/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/YOUR_GITHUB_USER/taskflow-ai/actions/workflows/ci-cd.yml)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?logo=supabase)

## Features

- **Kanban board** — drag-and-drop tasks across *Por hacer*, *En progreso*, and *Terminado* columns
- **AI assistant** — RAG pipeline answers questions about your tasks using Voyage AI embeddings + Supabase pgvector
- **Dual inference** — switch between Anthropic (Claude Sonnet 4.6) and Groq (LLaMA 3.3-70b) at runtime
- **Voice input** — Web Speech API transcription feeds the chat (Chrome, `es-ES` locale)
- **Auth** — Supabase email/password, session managed via httpOnly cookies + Next.js middleware

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth + `@supabase/ssr` |
| Drag & Drop | @dnd-kit |
| Embeddings | Voyage AI `voyage-3.5` (1024-dim halfvec) |
| AI inference | Anthropic Claude Sonnet 4.6 / Groq LLaMA 3.3-70b |

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project with the `pgvector` extension enabled
- API keys for [Anthropic](https://console.anthropic.com), [Voyage AI](https://www.voyageai.com), and [Groq](https://console.groq.com)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local` at the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

ANTHROPIC_API_KEY=sk-ant-...
VOYAGE_API_KEY=pa-...
GROQ_API_KEY=gsk_...
```

### 3. Run database migrations

Run the SQL files in order against your Supabase project (via the SQL editor or Supabase CLI):

```
supabase/migrations/001_profiles.sql
supabase/migrations/002_tasks.sql
supabase/migrations/003_rls.sql
supabase/migrations/004_enable_vector.sql
supabase/migrations/005_task_embeddings.sql
supabase/migrations/006_match_embeddings.sql
```

### 4. Start development server

```bash
npm run dev   # http://localhost:3000
```

The root `/` is a public demo with mock data. The full authenticated experience is at `/dashboard`.

### 5. Backfill embeddings (once, after migrations)

```bash
npx ts-node -r dotenv/config src/scripts/embed-all-tasks.ts
```

## Testing

```bash
npm test                 # Unit tests (Vitest)
npm run test:coverage    # Unit tests + v8 coverage report
npm run test:e2e         # End-to-end tests (Playwright, requires dev server)
npm run test:e2e:ui      # Playwright interactive UI
```

E2E tests require two additional variables in `.env.local`:

```env
E2E_USER_EMAIL=your-test-user@example.com
E2E_USER_PASSWORD=your-test-password
```

## Deployment

The app deploys to Vercel automatically on every push to `main` via GitHub Actions (after CI passes). See `.github/workflows/ci-cd.yml` and `CONTRIBUTING.md` for the required secrets.

For a manual deploy:

```bash
vercel deploy --prod
```

## Cambio para validar CI/CD
