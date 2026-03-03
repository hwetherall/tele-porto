# Tele-Porto — Technical Requirements

This file summarises the technical spec for Ralph. Full architecture details are in the project root: `architecture.md`.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (Postgres) |
| AI/LLM | OpenRouter (claude-sonnet or haiku) |
| STT | Groq Whisper API |
| TTS | Browser Web Speech API (pt-BR), fallback ElevenLabs |
| Auth | None — user switcher (Harry/Ky) in localStorage |

## Key Constraints

- **Server components by default** — client only for voice, localStorage, interactivity
- **All external API calls** via `/app/api/` route handlers (no client-side secrets)
- **Supabase**: `createServerClient` in server components, `createBrowserClient` in client
- **Error boundaries** on all AI-dependent components
- **Mobile-first** — 390px baseline

## Supabase Schema (from CLAUDE.md)

- `users` — id, name, xp, level, streak_count, last_active, journey_stage
- `phrases` — id, portuguese, english, category (enum), audio_url, created_by
- `sr_cards` — user_id, phrase_id, box (1–6), next_review, ease_factor, interval_days, times_seen, times_correct
- `scenarios` — id, title, description, pack, unlock_level, system_prompt
- `session_logs` — user_id, date, cards_reviewed, cards_correct, xp_earned, scenario_played

## API Routes

- `POST /api/transcribe` — Groq Whisper, FormData audio → transcript
- `POST /api/chat` — OpenRouter, messages + scenarioId → AI response
- SR card updates and session logging via dedicated API routes

## Folder Structure (target)

```
/app          — pages and API routes
/components   — ui, sr, voice, scenarios
/lib          — supabase, openrouter, groq, sm2, tts
/data         — seed-phrases, scenarios definitions
```

Refer to `architecture.md` at project root for data flows, SM-2 details, and component hierarchy.
