# Tele-Porto — Technical Architecture Spec

## Stack Decisions & Rationale

### Next.js 14 App Router
- Server components for data fetching (Supabase queries)
- Client components only for: voice recording, localStorage, interactive UI
- Route handlers (`/app/api/`) for all external API calls (OpenRouter, Groq)
- Never expose `OPENROUTER_API_KEY` or `GROQ_API_KEY` to the client

### Supabase
- Used for: all persistent data (users, phrases, SR state, session logs)
- Row Level Security: not needed (no auth), but set up service key for server-side writes
- Realtime: not required for V1
- Use `@supabase/ssr` package — `createServerClient` in Server Components, `createBrowserClient` in Client Components

### No Authentication
- Profile stored in `localStorage` as `activeUser: "Harry" | "Ky"`
- All Supabase queries include `.eq('name', activeUser)` filter
- No sessions, no JWT, no middleware auth checks
- Users table is seeded with Harry and Ky rows at setup

### OpenRouter
- Used for: Scene Simulator AI conversations, Custom Phrase translation assist
- Model: `anthropic/claude-3-haiku-20240307` for speed/cost, upgradeable to `claude-3-5-sonnet`
- Route: `POST /app/api/chat` — body: `{ messages, scenarioId }`
- Scenario system prompt fetched from Supabase `scenarios.system_prompt`

### Groq Whisper
- Used for: Shadow Mode pronunciation check, Big Five voice driller, Scene Simulator voice input
- Route: `POST /app/api/transcribe` — body: FormData with audio blob
- Model: `whisper-large-v3`
- Returns: `{ transcript: string, confidence: number }`
- Client sends: `audio/webm` blob from MediaRecorder API

### Text-to-Speech
- Primary: `window.speechSynthesis` with `lang: 'pt-BR'`
  - Free, built into browser, good enough for V1
  - Voice selection: prefer `pt-BR` voices, fallback to any `pt` voice
- Secondary (future): ElevenLabs with a Brazilian Portuguese voice clone

---

## Spaced Repetition — SM-2 Algorithm

### Card States
```typescript
type SRCard = {
  box: 1 | 2 | 3 | 4 | 5 | 6      // Phase 6 box
  ease_factor: number               // Default 2.5, min 1.3
  interval_days: number             // Days until next review
  next_review: string               // ISO date
  times_seen: number
  times_correct: number
}
```

### Review Logic (`/lib/sm2.ts`)
```typescript
// Rating 0-5 (0=blackout, 5=perfect)
// Rating < 3 → card drops back to box 1
// Rating >= 3 → interval increases, ease_factor adjusts
// Box = Math.min(6, Math.ceil(log2(interval_days + 1)))
```

### Box ↔ Interval Mapping (approximate)
| Box | Review interval |
|-----|----------------|
| 1   | Next session (same day or next day) |
| 2   | 1 day |
| 3   | 3 days |
| 4   | 7 days |
| 5   | 14 days |
| 6   | 30+ days (mastered) |

---

## Data Flow Diagrams

### SR Review Session
```
User taps "Start Review"
  → getDueCards(userId) → Supabase query sr_cards where next_review <= today
  → Loop through cards:
      Show card front (English)
      User taps to reveal / speaks answer
      User rates (correct / incorrect)
      reviewCard(card, rating) → new card state
      PATCH /api/sr-cards → update Supabase
  → Session ends → POST /api/session-log → increment XP
```

### Scene Simulator
```
User selects scenario
  → Fetch scenario from Supabase (system_prompt, title, description)
  → User types or records voice
      Voice: POST /api/transcribe → transcript
  → POST /api/chat with { messages: [...history, newMessage], systemPrompt }
  → AI responds in Portuguese
  → User taps response to see English explanation (second API call or inline)
  → On end: POST /api/session-log
```

---

## Component Hierarchy

```
RootLayout
  GlobalNav (user name, XP, streak)
  
HomePage
  UserSwitcher (Harry / Ky buttons)
  DailyQuest
  StreakDisplay (Harry vs Ky)
  BoxOverview (SR box counts)
  
LearnPage
  BoxSystem
  ReviewSession
    PhraseCard
    VoiceButton
    ShadowMode
    
DrillPage
  VerbSelector (Big Five)
  ConjugationDriller
    VoiceButton
    ConjugationTable
    
ScenariosPage
  PackGrid (Household / Work / Wedding)
  ScenarioCard (locked/unlocked)
  
ScenarioPage [id]
  ScenarioHeader
  ChatInterface
    MessageBubble
    VoiceButton
    HintPanel
    
PhrasesPage
  AddPhraseForm
  PhraseList
  
JourneyPage
  JourneyMap (London → Ericeira)
  LocationCard
```

---

## Seed Data Strategy

Seed SQL file at `/supabase/seed.sql` should:
1. Insert Harry and Ky into `users` table
2. Insert 80+ phrases into `phrases` table
3. Insert 8 scenarios into `scenarios` table  
4. Insert initial `sr_cards` rows for both users (all phrases, all in box 1)

The seed file should be idempotent — use `ON CONFLICT DO NOTHING` so it can be re-run safely.

---

## Key Design Patterns

### Active User Hook
```typescript
// /lib/hooks/useActiveUser.ts
export function useActiveUser() {
  const [user, setUser] = useState<"Harry" | "Ky" | null>(null)
  
  useEffect(() => {
    const stored = localStorage.getItem("activeUser")
    if (stored === "Harry" || stored === "Ky") setUser(stored)
  }, [])
  
  const switchUser = (name: "Harry" | "Ky") => {
    localStorage.setItem("activeUser", name)
    setUser(name)
  }
  
  return { user, switchUser }
}
```

### API Route Pattern
```typescript
// All API routes follow this pattern
export async function POST(request: Request) {
  try {
    const body = await request.json()
    // ... validate, process, respond
    return Response.json({ success: true, data: result })
  } catch (error) {
    return Response.json({ success: false, error: "message" }, { status: 500 })
  }
}
```
