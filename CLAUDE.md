# Tele-Porto — Claude Code Project Brief

## What Is This?

Tele-Porto is a personalised, AI-powered Portuguese learning web app built for two users: **Harry** and **Ky**. It is opinionated, relevant to their actual lives, and built around proven learning science (spaced repetition, Big Five verbs, scenario-based practice).

This is NOT a generic language app. Every lesson, scenario, and phrase is tied to real contexts in Harry and Ky's life:
- Their nanny **Mychelle** (from São Paulo, Brazilian Portuguese)
- Harry's direct report **Felipe** (from Salvador, Bahia)
- An upcoming **wedding in Ericeira, Portugal** (September)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Deployment | Vercel |
| Database | Supabase (Postgres + Realtime) |
| AI / LLM | OpenRouter (claude-sonnet or similar) |
| Speech-to-Text | Groq Whisper API |
| Text-to-Speech | Browser Web Speech API (fallback: ElevenLabs) |
| Auth | **None** — simple user switcher (Harry / Ky) stored in localStorage |

---

## Core Philosophy

1. **Relevance over breadth** — Teach phrases Harry and Ky will actually use this week, not "directions to the art gallery"
2. **Big Five Verbs first** — *estar, ir, ter, querer, fazer* in present tense covers 70% of real conversation
3. **Spaced repetition** — Phase 6-style box system (6 boxes, SM-2 algorithm, visible progress)
4. **Bilingual AI** — Conversations in Portuguese, explanations in English. Never feel like talking to an alien
5. **Gamified narrative** — Progress tied to a story ("Harry's Road to Ericeira") with milestones and unlocks

---

## Users

No authentication. On launch, user picks their profile. This is stored in `localStorage`.

```
Users: ["Harry", "Ky"]
```

Each user has separate:
- SR (spaced repetition) progress
- XP and level
- Streak
- Scenario completion history

---

## Key Features (V1 Priority Order)

1. **User Switcher** — Harry / Ky selector on launch, no passwords
2. **Phase 6 Box System** — 6 visible SR boxes, phrase cards move between them
3. **Big Five Driller** — Voice-based conjugation practice for estar/ir/ter/querer/fazer
4. **Scenario Library** — Household (Mychelle), Work (Felipe), Ericeira Wedding packs
5. **Scene Simulator** — Live bilingual AI conversation in a chosen scenario
6. **Shadow Mode** — AI speaks a phrase, user repeats, Whisper checks pronunciation
7. **Custom Phrase Bank** — Add your own phrases to your SR deck
8. **Journey / Narrative Wrapper** — "Harry's Road to Ericeira" story progression
9. **Daily Quest** — One focused task per day
10. **Session Summary** — Post-session dopamine hit with what you learned

---

## Supabase Schema Overview

### Tables

**`users`**
- `id` (uuid)
- `name` (text) — "Harry" or "Ky"
- `xp` (int)
- `level` (int)
- `streak_count` (int)
- `last_active` (date)
- `journey_stage` (int)

**`phrases`**
- `id` (uuid)
- `portuguese` (text)
- `english` (text)
- `category` (enum: household, work, wedding, big_five, custom)
- `audio_url` (text, optional)
- `created_by` (text, nullable — for custom phrases)

**`sr_cards`** (spaced repetition state per user per phrase)
- `id` (uuid)
- `user_id` (uuid → users)
- `phrase_id` (uuid → phrases)
- `box` (int, 1–6)
- `next_review` (date)
- `ease_factor` (float, SM-2)
- `interval_days` (int)
- `times_seen` (int)
- `times_correct` (int)

**`scenarios`**
- `id` (uuid)
- `title` (text)
- `description` (text)
- `pack` (enum: household, work, wedding)
- `unlock_level` (int)
- `system_prompt` (text) — AI persona/instructions for this scenario

**`session_logs`**
- `id` (uuid)
- `user_id` (uuid → users)
- `date` (timestamp)
- `cards_reviewed` (int)
- `cards_correct` (int)
- `xp_earned` (int)
- `scenario_played` (text, nullable)

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
OPENROUTER_API_KEY=
GROQ_API_KEY=
```

---

## Project Structure

Ralph (Claude Code autonomous loop) config lives in `.ralph/` — see [ralph-claude-code](https://github.com/frankbria/ralph-claude-code). Use `PROMPT.md`, `fix_plan.md`, and `AGENT.md` there when running Ralph.

```
/app
  /layout.tsx
  /page.tsx                  ← User switcher / home
  /learn
    /page.tsx                ← SR box system + daily quest
  /drill
    /page.tsx                ← Big Five conjugation driller
  /scenarios
    /page.tsx                ← Scenario library
    /[id]/page.tsx           ← Scene simulator
  /phrases
    /page.tsx                ← Custom phrase bank
  /journey
    /page.tsx                ← Narrative progress map
  /profile
    /[user]/page.tsx         ← Stats, streaks, settings

/components
  /ui                        ← Shared UI primitives
  /sr                        ← Spaced repetition components
  /voice                     ← Groq Whisper + TTS components
  /scenarios                 ← Scene simulator components

/lib
  /supabase.ts
  /openrouter.ts
  /groq.ts
  /sm2.ts                    ← SM-2 spaced repetition algorithm
  /tts.ts

/data
  /seed-phrases.ts           ← Initial phrase library
  /scenarios.ts              ← Scenario definitions
```

---

## Coding Standards

- TypeScript throughout — no `any` types
- Server components by default, client components only where needed (voice, interactivity)
- Tailwind for all styling — no CSS modules or styled-components
- All API calls go through `/app/api/` route handlers — no client-side secrets
- Supabase client: use `createServerClient` in server components, `createBrowserClient` in client components
- Error boundaries on all AI-dependent components
- Mobile-first design — this will be used on phones during practice sessions

---

## Tone & Design Notes

- Warm, encouraging, not corporate
- Portuguese green and gold as primary palette
- Big, readable text for quick glancing during practice
- Celebration animations on milestone completions (confetti, etc.)
- Duolingo-adjacent feel but more personal and less gamey
