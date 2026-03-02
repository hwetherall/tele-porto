# Ralph Development Instructions — Tele-Porto

## Project Mission

Build **Tele-Porto**: a personalised, AI-powered Portuguese learning web app for two users (Harry and Ky). The app is opinionated, life-relevant, and grounded in proven learning science.

**Read `CLAUDE.md` at the project root for full context before starting any task.**

---

## Development Principles

1. **Ship working features** — always leave the app in a runnable state after each loop
2. **Follow the fix_plan.md task order** — do not jump ahead or skip phases
3. **TypeScript strictly** — no `any`, proper types for all Supabase and API responses
4. **Mobile-first** — every UI component must look good on a 390px wide screen
5. **Test as you build** — verify each feature works before marking complete
6. **Seed data matters** — the app should have real, useful Portuguese content from day one, not placeholder lorem ipsum

---

## How to Signal Completion

At the end of each loop, output a status block:

```
RALPH_STATUS:
  summary: [what was built or changed this loop]
  tasks_completed: [list from fix_plan.md]
  blockers: [anything that needs human input]
  EXIT_SIGNAL: false
```

Only set `EXIT_SIGNAL: true` when ALL tasks in `fix_plan.md` are checked off.

---

## Critical Context

### Language: Brazilian Portuguese
The app teaches **Brazilian Portuguese** (not European). Mychelle is from São Paulo, Felipe is from Salvador. The Ericeira wedding will have European Portuguese speakers but the learning baseline is Brazilian.

### The Big Five Verbs
These are the core of the teaching philosophy:
- **estar** — to be (temporary)
- **ir** — to go
- **ter** — to have
- **querer** — to want
- **fazer** — to do/make

Every conjugation drill and lesson should prioritise these five before anything else.

### No Authentication
Users are Harry and Ky. Profile selection happens on the home screen via a simple two-button UI. Store the active user in `localStorage` as `{ activeUser: "Harry" | "Ky" }`. All Supabase queries filter by user name.

### AI Conversations
All AI conversation features use OpenRouter via the `/app/api/chat/route.ts` server route. Never expose the API key client-side. The system prompt for each scenario is stored in the `scenarios` table in Supabase.

### Voice Features
- STT: Groq Whisper via `/app/api/transcribe/route.ts`
- TTS: Browser `window.speechSynthesis` as primary (set lang to `pt-BR`), ElevenLabs as optional upgrade
- Always include a text fallback for every voice interaction

---

## What Good Looks Like

A session flow that works:
1. User opens app → taps their name (Harry or Ky)
2. Sees today's daily quest + SR box overview
3. Taps into SR review → works through due cards, speaks answers, gets feedback
4. Optionally launches a scenario → has a bilingual AI conversation
5. Ends session → sees summary screen with XP earned + what they learned

If this flow works end-to-end, the app is in a good state.
