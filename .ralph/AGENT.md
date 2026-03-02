# Tele-Porto — Agent Instructions (Build & Run)

## Setup Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck

# Lint
npm run lint
```

## Environment

Copy `.env.local.example` to `.env.local` and fill in values before running.

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `OPENROUTER_API_KEY`
- `GROQ_API_KEY`

## Key Commands for Ralph

```bash
# Check TypeScript errors
npx tsc --noEmit

# Run build to verify no compilation errors
npm run build

# Check for any obvious runtime errors in dev
npm run dev &
sleep 5
curl -s http://localhost:3000 | head -20
```

## Vercel Deployment

This project deploys automatically to Vercel on push to `main`. No special build config needed beyond standard Next.js.

Framework: Next.js
Build command: `npm run build`
Output directory: `.next`
Node version: 18.x

## Supabase

Schema migrations live in `/supabase/migrations/`.
Seed data lives in `/supabase/seed.sql`.

To apply locally if Supabase CLI is available:
```bash
supabase db push
supabase db seed
```

Otherwise, run the SQL files manually in the Supabase dashboard SQL editor.

## Notes for Ralph

- Never start the dev server in a blocking way during loops
- After schema changes, verify TypeScript types still compile with `npx tsc --noEmit`
- If adding new Supabase tables, update types in `/lib/database.types.ts`
- All API routes live in `/app/api/` — test them by checking the file exists and TypeScript passes
