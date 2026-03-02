# Tele-Porto — Coding Standards (stdlib)

Reusable conventions for Ralph and human developers.

## TypeScript

- **No `any`** — use proper types for all Supabase responses, API payloads, and props
- Prefer `interface` for object shapes; use `type` for unions and derived types
- Export types from a central place when shared (e.g. `lib/database.types.ts`)

## Styling

- **Tailwind only** — no CSS modules, no styled-components
- Mobile-first: design for 390px first, then `md:` / `lg:` as needed
- Portuguese green and gold as primary palette; warm, readable text

## Components

- **Server components by default** — add `"use client"` only when needed (voice, localStorage, hooks, interactivity)
- One component per file; co-locate with feature when small (e.g. under `components/sr/`)

## API & Data

- All external API calls (OpenRouter, Groq) in `/app/api/` route handlers
- Never expose `OPENROUTER_API_KEY` or `GROQ_API_KEY` to the client
- Supabase: `createServerClient` in server components, `createBrowserClient` in client components

## Error Handling

- Error boundaries around every AI-dependent component
- API routes: return `Response.json({ success: false, error: "message" }, { status: 500 })` on catch
- Always provide a text fallback for voice interactions

## Naming

- Components: PascalCase
- Files: kebab-case for utilities, PascalCase for components
- Hooks: `use*` prefix
- API routes: descriptive path (e.g. `transcribe`, `chat`, `sr-cards`)
