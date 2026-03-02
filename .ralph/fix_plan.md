# Tele-Porto — Fix Plan (Ralph Task List)

Tasks are ordered by phase. Complete Phase 1 fully before moving to Phase 2. Mark tasks with [x] when done.

---

## Phase 1 — Foundation (Get the App Running)

### 1.1 Project Setup
- [x] Initialise Next.js 14 app with TypeScript and Tailwind CSS
- [x] Install and configure Supabase client (`@supabase/ssr`)
- [x] Set up environment variables structure (`.env.local.example`)
- [x] Configure Vercel-compatible `next.config.js`
- [x] Set up basic folder structure per `CLAUDE.md`

### 1.2 Supabase Schema
- [x] Create `users` table with all fields from CLAUDE.md schema
- [x] Create `phrases` table with category enum
- [x] Create `sr_cards` table with SM-2 fields
- [x] Create `scenarios` table with system_prompt field
- [x] Create `session_logs` table
- [x] Write and run seed SQL for initial phrase library (minimum 50 phrases across all categories)
- [x] Write and run seed SQL for initial scenarios (Household, Work, Wedding packs)
- [x] Write and run seed SQL for Harry and Ky user rows

### 1.3 User Switcher (Home Screen)
- [x] Build home page with two large profile buttons (Harry / Ky)
- [x] Store active user in localStorage on selection
- [x] Build `useActiveUser()` hook that reads from localStorage
- [x] Redirect to `/learn` after profile selection
- [x] Add user name + avatar indicator to global nav

---

## Phase 2 — Spaced Repetition Core

### 2.1 SM-2 Algorithm
- [x] Implement SM-2 algorithm in `/lib/sm2.ts`
- [x] Function: `reviewCard(card, rating: 0|1|2|3|4|5)` → returns updated card fields
- [x] Function: `getDueCards(userId)` → returns cards due today from Supabase

### 2.2 Phase 6 Box UI
- [x] Build `BoxSystem` component showing 6 boxes with card counts
- [x] Cards animate between boxes on review
- [x] Box 1 = new/failed, Box 6 = mastered
- [x] Show total cards per box, highlight boxes with due cards

### 2.3 SR Review Session
- [x] Build review session flow: show phrase card → user answers → mark correct/incorrect
- [x] Card shows English front, Portuguese back (tap to reveal or speak)
- [x] After reveal: thumbs up / thumbs down rating
- [x] On completion: update `sr_cards` in Supabase via API route
- [x] Show session complete screen with cards reviewed, XP earned

### 2.4 Phrase Cards
- [x] `PhraseCard` component: Portuguese text, English translation, category badge
- [x] TTS button: speaks the Portuguese phrase using `window.speechSynthesis` (pt-BR)
- [x] Cards responsive and readable on mobile

---

## Phase 3 — Voice Features

### 3.1 Groq Whisper Integration
- [x] Build `/app/api/transcribe/route.ts` — accepts audio blob, returns transcript
- [x] Build `useVoiceRecorder()` hook — MediaRecorder API, returns audio blob
- [x] Build `VoiceButton` component — press and hold to record, release to transcribe

### 3.2 Big Five Conjugation Driller
- [x] Build `/app/drill` page
- [x] Select verb from Big Five → select pronoun → app says prompt → user speaks conjugation
- [x] Whisper transcribes → compare to expected → show correct/incorrect
- [x] Track streak within drill session
- [x] Show full conjugation table after each verb is completed

### 3.3 Shadow Mode
- [x] Build Shadow Mode component within `/app/learn`
- [x] AI speaks a phrase (TTS) → user repeats → Whisper transcribes → compare
- [x] Simple match scoring (exact match or close enough via string similarity)
- [x] "Try again" option

---

## Phase 4 — Scenario Conversations

### 4.1 OpenRouter Chat API
- [x] Build `/app/api/chat/route.ts` — accepts messages array + scenario system prompt, returns AI response
- [x] Use `openrouter` with `anthropic/claude-3-haiku` or similar fast/cheap model
- [x] System prompt instructs: respond primarily in Portuguese, explain corrections in English, keep it conversational

### 4.2 Scenario Library
- [x] Build `/app/scenarios` page — grid of scenario cards by pack
- [x] Household pack: Morning Handover, End of Day, Weekend Plans, Kids Sick, Gratitude
- [x] Work pack: Pre-Meeting Chat, Corridor Small Talk, How Was Your Weekend
- [x] Wedding pack: Introductions, Toasting, Ordering at Bar, Complimenting Someone (locked until Level 3)
- [x] Show lock/unlock state based on user level

### 4.3 Scene Simulator
- [x] Build `/app/scenarios/[id]` page
- [x] Chat interface: user types or speaks → AI responds in Portuguese → English explanation on tap
- [x] Show scenario context at top ("You are arriving at Felipe's desk before a meeting...")
- [x] Voice input via VoiceButton component
- [x] "Hint" button: shows suggested phrase in English and Portuguese
- [x] End session button → log to `session_logs`

---

## Phase 5 — Gamification & Narrative

### 5.1 XP & Levels
- [x] XP rules: 10 XP per SR card reviewed, 5 bonus per correct, 50 XP per scenario completed
- [x] Level thresholds: Level 1=0, Level 2=200, Level 3=500, Level 4=1000, Level 5=2000
- [x] Update `users` table on XP gain via API route
- [x] Level-up toast notification

### 5.2 Streak System
- [x] Update `last_active` on each session
- [x] Calculate streak from `session_logs` dates
- [x] Show streak flame on home screen
- [x] Shared household streak: both Harry and Ky must have practiced today (GET /api/session-logs)

### 5.3 Journey Map ("Dom's Road to Ericeira")
- [x] Build `/app/journey` page
- [x] Visual map: London → Lisbon → Sintra → Cascais → Ericeira
- [x] Each location unlocks at a certain level/XP
- [x] Each location has flavour text and unlocks a scenario pack
- [x] Current location has animated indicator

### 5.4 Daily Quest
- [x] Generate daily quest on home screen based on: weakest SR cards, time since last scenario, Big Five gaps
- [x] One focused task: "Today: Review 10 household phrases" or "Today: Try the Morning Handover scenario"
- [x] Mark complete with XP reward

### 5.5 Session Summary Screen
- [x] After any session: show cards reviewed, accuracy %, XP earned, streak maintained
- [x] Highlight any new words that moved to a higher box
- [x] Encouraging message in Portuguese with English translation

---

## Phase 6 — Custom Phrases & Polish

### 6.1 Custom Phrase Bank
- [x] Build `/app/phrases` page
- [x] Add phrase form: English → Portuguese (with AI assist button that suggests translation)
- [x] Added phrases go to `phrases` table with `created_by` set and automatically get `sr_cards` rows
- [x] List view of all custom phrases with edit/delete

### 6.2 Harry vs Ky Dashboard
- [x] Home screen shows mini-leaderboard: Harry vs Ky XP, streak, boxes mastered
- [x] Gentle competitive framing ("Ky is 50 XP ahead!")

### 6.3 Pre-Trip Countdown
- [x] Configurable wedding date (September 2026 — Ericeira)
- [x] Countdown on home screen: "X days to the wedding"
- [x] At <60 days: Wedding Pack gets highlighted, special daily quests focus on wedding scenarios

### 6.4 Final Polish
- [x] Loading states on all async operations
- [x] Error boundaries on all AI components (ChatInterface, ShadowMode)
- [x] Empty states for new users with onboarding nudges
- [x] Responsive QA pass on mobile (390px)
- [x] Favicon and app metadata (app/icon.svg)
- [ ] Deploy to Vercel with production env vars

---

## Seed Data Requirements

### Phrases to seed (minimum, spread across categories):

**Big Five (30 phrases)** — present tense conjugations and usage examples for estar, ir, ter, querer, fazer

**Household / Mychelle (20 phrases)**
Examples:
- Como foi o dia? / How was the day?
- As crianças comeram bem? / Did the kids eat well?
- Pode ficar mais uma hora? / Can you stay an extra hour?
- Obrigado por tudo hoje / Thank you for everything today
- A que horas você chega amanhã? / What time do you arrive tomorrow?

**Work / Felipe (15 phrases)**
Examples:
- Tudo bem? / How's everything?
- Como foi o fim de semana? / How was the weekend?
- Pronto para a reunião? / Ready for the meeting?

**Wedding / Ericeira (15 phrases)**
Examples:
- Que festa linda! / What a beautiful party!
- Você conhece os noivos? / Do you know the couple?
- Saúde! / Cheers!
- Posso te apresentar... / Can I introduce you to...

**Custom (0)** — user-generated, starts empty
