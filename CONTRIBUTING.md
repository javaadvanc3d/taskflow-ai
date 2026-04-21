# Contributing to TaskFlow AI

## Branching strategy

| Branch | Purpose |
|---|---|
| `main` | Production — always deployable, protected |
| `develop` | Optional integration branch for grouping features |
| `feature/<short-description>` | New features (`feature/ai-voice-input`) |
| `fix/<short-description>` | Bug fixes (`fix/kanban-drop-target`) |
| `chore/<short-description>` | Non-functional changes (`chore/update-deps`) |

Branch from `main` (or `develop` if active). Keep branches short-lived.

## Commit conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add speech input to task chat
fix: revert optimistic update on auth error
chore: bump @supabase/ssr to 0.11
docs: update migration steps in README
test: add createTask embedding failure case
refactor: extract useKanbanDnd hook from KanbanBoard
```

## Pull request process

1. Branch off `main` and open a PR targeting `main`
2. CI must pass (lint, type check, unit tests, build)
3. Describe *what* changed and *why* in the PR body
4. One approval required before merging

## Required GitHub Actions secrets

Set these in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|---|---|
| `TOKEN_SERVER_AI` | Vercel access token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (used by embeddings) |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `VOYAGE_API_KEY` | Voyage AI API key |
| `GROQ_API_KEY` | Groq API key |
| `TEST_USER_EMAIL` | Email of the Supabase test account for E2E |
| `TEST_USER_PASSWORD` | Password of the Supabase test account for E2E |

## Code guidelines

See the mandatory rules in [`CLAUDE.md`](./CLAUDE.md):
- TypeScript strict — no `any`
- Server Components by default; `'use client'` only when necessary
- Server Actions for all mutations
- RLS must be enabled on every table
- Do not remove existing `console.log` statements
