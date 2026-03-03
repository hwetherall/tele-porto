# Tele-Porto — Tutor Feature Brief

## Goal

Build a `/tutor` section of the app that teaches Harry and Ky Portuguese from scratch — before they practise anything. The core philosophy: **you cannot practise what you haven't learned**. The tutor introduces concepts, explains them in plain English, then immediately makes the user apply them. Over time, it tracks exactly where each user struggles and adapts which lessons it serves.

---

## Route Structure

```
/tutor                    ← Tutor home: lesson map + adaptive recommendations
/tutor/[lessonId]         ← Individual lesson page (explanation + exercises)
```

---

## The 10 Lessons

All 10 lessons focus exclusively on the **Big Five verbs** (estar, ir, ter, querer, fazer). Difficulty increases marginally. Each lesson is self-contained but builds on the last. Every example sentence must use real-life context: Mychelle, Felipe, or the Ericeira wedding.

| # | ID | Title | Core Concept | Concepts Covered |
|---|-----|-------|-------------|-----------------|
| 1 | `estar-intro` | What does *estar* mean? | estar in present tense | `estar-meaning`, `estar-conjugation-eu`, `estar-conjugation-voce` |
| 2 | `ter-intro` | Saying what you *have* | ter in present tense | `ter-meaning`, `ter-conjugation-eu`, `ter-conjugation-voce` |
| 3 | `ir-intro` | Going places with *ir* | ir in present tense | `ir-meaning`, `ir-conjugation-eu`, `ir-conjugation-voce` |
| 4 | `querer-intro` | Saying what you *want* | querer in present tense | `querer-meaning`, `querer-conjugation-eu`, `querer-conjugation-voce` |
| 5 | `fazer-intro` | Doing things with *fazer* | fazer in present tense | `fazer-meaning`, `fazer-conjugation-eu`, `fazer-conjugation-voce` |
| 6 | `full-conjugation` | All forms of all five | Plural pronouns (nós, eles) | `conjugation-nos`, `conjugation-eles`, `conjugation-review` |
| 7 | `negation` | Making sentences negative | não + verb | `negation-basic`, `negation-with-big-five` |
| 8 | `ir-future` | Talking about your plans | ir + infinitive (near future) | `ir-future`, `ir-future-with-fazer`, `ir-future-with-querer` |
| 9 | `combining` | Chaining two verbs together | querer + infinitive, ter + que + infinitive | `verb-chaining-querer`, `verb-chaining-ter-que` |
| 10 | `real-conversation` | Putting it all together | All five verbs, in real sentences | `full-review`, `real-context-mychelle`, `real-context-felipe`, `real-context-wedding` |

---

## Lesson Format

Each lesson has three phases rendered on a single page, navigated step by step:

### Phase 1: Explanation (READ)
- 3–5 sentences of plain English explanation
- A small conjugation table (if relevant) — just the forms being taught this lesson
- 2–3 example sentences from Mychelle/Felipe/wedding context, shown as:
  `[Portuguese] — [English]`
- A "Got it →" button to proceed

### Phase 2: Guided Practice (DO)
- 3–5 interactive exercises (details below)
- User completes them one at a time
- Immediate feedback after each: ✓ Correct / ✗ Try again (show correct answer after 2 fails)
- Each exercise is tagged with the concept(s) it tests

### Phase 3: Lesson Complete (REFLECT)
- Show score: X/Y correct
- List which concepts the user nailed and which were shaky
- XP award (base 50 XP per lesson, +10 bonus for perfect score)
- Button: "Back to tutor map"

---

## Exercise Types

Build three exercise types. Each exercise object in code includes a `conceptTags` array.

### 1. Fill in the blank
```
Eu ___ com Mychelle amanhã. (ir)
[ text input ]
Answer: vou
```

### 2. Multiple choice (pick the right conjugation)
```
Which is correct? Felipe ___ fazer isso.
○ quer
○ quero
○ queremos
```

### 3. Translate the sentence
```
Translate to Portuguese:
"I don't have time today."
[ text input ]
Answer: Eu não tenho tempo hoje.
(Accept minor variations — use Claude API to check fuzzy match)
```

For translation exercises, call the Claude API to evaluate the answer:
```javascript
// POST /api/tutor/check-translation
// Body: { userAnswer: string, targetAnswer: string, conceptTags: string[] }
// Returns: { correct: boolean, feedback: string }
// System prompt: "You are evaluating a Portuguese translation exercise.
// The expected answer is '{targetAnswer}'. The user wrote '{userAnswer}'.
// Is this correct or acceptably close? Reply with JSON: { correct: boolean, feedback: string }.
// Be lenient on accent marks but strict on verb conjugation."
```

---

## Adaptive System

This is the most important part of the feature. The system tracks **concept-level mastery**, not just lesson scores.

### Data Model

Add these tables to Supabase:

**`tutor_lessons`** (static seed data — one row per lesson)
```sql
id          text PRIMARY KEY  -- e.g. 'estar-intro'
title       text
lesson_order int
concept_tags text[]           -- all concepts this lesson covers
unlocked_by text              -- lesson id that must be completed first (nullable)
```

**`tutor_progress`** (one row per user per lesson)
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id     uuid REFERENCES users(id)
lesson_id   text REFERENCES tutor_lessons(id)
completed   boolean DEFAULT false
score       int               -- number correct
max_score   int               -- total exercises
attempts    int DEFAULT 0
last_attempt timestamp
xp_earned   int DEFAULT 0
```

**`tutor_concept_scores`** (one row per user per concept tag)
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id     uuid REFERENCES users(id)
concept_tag text              -- e.g. 'estar-conjugation-eu'
times_tested int DEFAULT 0
times_correct int DEFAULT 0
mastery_pct  int GENERATED ALWAYS AS (
  CASE WHEN times_tested = 0 THEN 0
  ELSE (times_correct * 100 / times_tested)
  END
) STORED
last_updated timestamp
```

### Concept Mastery Tiers

| Mastery % | Tier | Badge |
|-----------|------|-------|
| 0–40% | Struggling | 🔴 |
| 41–70% | Getting there | 🟡 |
| 71–90% | Solid | 🟢 |
| 91–100% | Mastered | ⭐ |

### Adaptive Logic

After each lesson completes, the system:

1. **Updates `tutor_concept_scores`** — increment `times_tested` and `times_correct` for each concept tag tested in that lesson
2. **Identifies weak concepts** — any concept with mastery < 70%
3. **Surfaces the right next lesson** — on the tutor home page, the "Recommended" lesson is chosen by:
   - Find which lessons cover the user's weakest concept tags
   - Prioritise lessons the user has never attempted OR lessons where score < 80%
   - If all lessons are mastered (all concepts ≥ 85%), recommend Lesson 10 as a final review

**Important:** Lessons 1–5 are always unlocked. Lessons 6–10 unlock when the relevant prereq lesson is completed (see `unlocked_by` column). The adaptive system can *recommend* a previously-completed lesson for review but never blocks the user from choosing their own lesson.

### Tutor Home Page Layout

```
TUTOR
"Learn the Big Five verbs before you practise them"

[Recommended for you]  ← adaptive pick, highlighted card with reason
"You struggled with estar conjugation — let's revisit it"

[Lesson Map — grid of 10 cards]
  Card shows: title, completion badge (✓/○), weakest concept tag if any

[Concept Mastery Panel]  ← collapsible
  List of all concept tags with mastery % and tier badge
  Sorted by mastery % ascending (weakest first)
```

---

## API Routes

### `POST /api/tutor/check-translation`
Validates free-text translation answers via Claude API.
```typescript
// Request
{ userAnswer: string, expectedAnswer: string }
// Response
{ correct: boolean, feedback: string }
```

### `POST /api/tutor/complete-exercise`
Records a single exercise result and updates concept scores.
```typescript
// Request
{ userId: string, lessonId: string, conceptTags: string[], correct: boolean }
// Response
{ success: boolean }
```

### `POST /api/tutor/complete-lesson`
Records lesson completion and awards XP.
```typescript
// Request
{ userId: string, lessonId: string, score: number, maxScore: number }
// Response
{ success: boolean, xpEarned: number }
```

### `GET /api/tutor/progress?userId=...`
Returns all tutor progress + concept scores for a user.
```typescript
// Response
{
  lessons: TutorProgress[],
  conceptScores: TutorConceptScore[],
  recommendedLesson: string  // lesson id
}
```

---

## Lesson Content (Seed Data)

All lesson content lives in `/data/tutor-lessons.ts`. Each lesson object:

```typescript
interface LessonContent {
  id: string
  title: string
  lessonOrder: number
  conceptTags: string[]
  unlockedBy: string | null
  explanation: {
    body: string           // plain English, 3-5 sentences
    conjugationTable?: {   // optional, shown only when relevant
      headers: string[]
      rows: { pronoun: string; form: string }[]
    }
    examples: { portuguese: string; english: string }[]
  }
  exercises: Exercise[]
}

type Exercise =
  | { type: 'fill-blank'; sentence: string; blank: string; answer: string; conceptTags: string[] }
  | { type: 'multiple-choice'; prompt: string; options: string[]; correctIndex: number; conceptTags: string[] }
  | { type: 'translate'; english: string; expectedAnswer: string; conceptTags: string[] }
```

**Content rules:**
- Every example sentence must reference Mychelle, Felipe, Harry, Ky, or the Ericeira wedding
- Never use abstract examples like "O homem vai ao mercado"
- Pronunciation hints in parentheses for tricky words: e.g. *quero* (KEH-roo)
- Keep the explanation tone warm and non-academic — write as if you're a smart friend, not a textbook

---

## UI / UX Notes

- Match the existing app aesthetic (green/gold, Tailwind, mobile-first)
- Progress through exercises with a top progress bar (e.g. "Exercise 3 of 5")
- Animate transitions between phases (simple fade or slide)
- On the tutor home map, completed lessons show a green ✓; locked lessons show a 🔒; recommended lesson has a pulsing gold ring
- Celebration on lesson complete: same confetti as the rest of the app
- Concept mastery panel on tutor home is collapsed by default — tap "See concept breakdown →" to expand

---

## Build Order

Follow this sequence — each step leaves the app in a runnable state:

1. **Supabase schema** — add `tutor_lessons`, `tutor_progress`, `tutor_concept_scores` tables + seed `tutor_lessons`
2. **Seed lesson content** — populate `/data/tutor-lessons.ts` with all 10 lessons (content + exercises)
3. **API routes** — build all 4 routes listed above
4. **`/tutor` home page** — lesson map, recommended card, concept mastery panel (can use mock data initially)
5. **`/tutor/[lessonId]` lesson page** — all 3 phases, all 3 exercise types
6. **Wire up API calls** — connect exercise/lesson completion to Supabase
7. **Adaptive recommendation logic** — implement `recommendedLesson` in the GET progress route
8. **Nav link** — add "Tutor" to global nav, between home and Learn

---

## Definition of Done

- Harry and Ky can each navigate to `/tutor`, see their personalised recommendation, open any unlocked lesson, work through all exercises, and reach the completion screen
- Concept scores update in Supabase after each exercise
- The recommended lesson changes after a lesson is completed
- Translation exercises call the Claude API for fuzzy matching
- Lesson map shows accurate completion state per user
- All UI is usable on a 390px screen

---

## What NOT to Build (Yet)

- Audio/TTS for lesson explanations (V2)
- Spaced repetition scheduling for lesson reviews (V2 — the SR box system handles that for phrases)
- Lesson unlocking based on XP level (V2)
- User-authored custom lessons (V2)
