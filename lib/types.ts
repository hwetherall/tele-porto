// ============================================================
// Core domain types for Tele-Porto
// ============================================================

export type UserName = 'Harry' | 'Ky'

export type PhraseCategory = 'household' | 'work' | 'wedding' | 'big_five' | 'custom' | 'general'

export type ScenarioPack = 'household' | 'work' | 'wedding'

// ============================================================
// Supabase table row types
// ============================================================

export interface User {
  id: string
  name: UserName
  xp: number
  level: number
  streak_count: number
  last_active: string | null
  journey_stage: number
}

export interface Phrase {
  id: string
  portuguese: string
  english: string
  category: PhraseCategory
  audio_url: string | null
  created_by: string | null
}

export interface SRCard {
  id: string
  user_id: string
  phrase_id: string
  box: 1 | 2 | 3 | 4 | 5 | 6
  next_review: string
  ease_factor: number
  interval_days: number
  times_seen: number
  times_correct: number
}

export interface SRCardWithPhrase extends SRCard {
  phrase: Phrase
}

export interface Scenario {
  id: string
  title: string
  description: string
  pack: ScenarioPack
  unlock_level: number
  system_prompt: string
}

export interface SessionLog {
  id: string
  user_id: string
  date: string
  cards_reviewed: number
  cards_correct: number
  xp_earned: number
  scenario_played: string | null
}

// ============================================================
// SM-2 types
// ============================================================

export type SM2Rating = 0 | 1 | 2 | 3 | 4 | 5

export interface SM2Result {
  box: 1 | 2 | 3 | 4 | 5 | 6
  ease_factor: number
  interval_days: number
  next_review: string
}

// ============================================================
// API response types
// ============================================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface TranscribeResponse {
  transcript: string
  confidence?: number
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// ============================================================
// XP / Level config
// ============================================================

export const XP_PER_CARD_REVIEWED = 10
export const XP_BONUS_CORRECT = 5
export const XP_PER_SCENARIO = 50

export const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 200,
  3: 500,
  4: 1000,
  5: 2000,
}

export function getLevelFromXP(xp: number): number {
  let level = 1
  for (const [lvl, threshold] of Object.entries(LEVEL_THRESHOLDS)) {
    if (xp >= threshold) level = parseInt(lvl)
  }
  return level
}

export function getXPForNextLevel(xp: number): { current: number; next: number; needed: number } | null {
  const currentLevel = getLevelFromXP(xp)
  const nextLevel = currentLevel + 1
  if (!LEVEL_THRESHOLDS[nextLevel]) return null
  return {
    current: LEVEL_THRESHOLDS[currentLevel],
    next: LEVEL_THRESHOLDS[nextLevel],
    needed: LEVEL_THRESHOLDS[nextLevel] - xp,
  }
}

// ============================================================
// Tutor types
// ============================================================

export const XP_PER_TUTOR_LESSON = 50
export const XP_BONUS_PERFECT = 10

export interface TutorProgress {
  id: string
  user_id: string
  lesson_id: string
  completed: boolean
  score: number
  max_score: number
  attempts: number
  last_attempt: string | null
  xp_earned: number
}

export interface TutorConceptScore {
  id: string
  user_id: string
  concept_tag: string
  times_tested: number
  times_correct: number
  mastery_pct: number
  last_updated: string | null
}

export type MasteryTier = 'struggling' | 'getting-there' | 'solid' | 'mastered'

export function getMasteryTier(pct: number): MasteryTier {
  if (pct <= 40) return 'struggling'
  if (pct <= 70) return 'getting-there'
  if (pct <= 90) return 'solid'
  return 'mastered'
}

export function getMasteryBadge(pct: number): string {
  const tier = getMasteryTier(pct)
  switch (tier) {
    case 'struggling': return '\uD83D\uDD34'
    case 'getting-there': return '\uD83D\uDFE1'
    case 'solid': return '\uD83D\uDFE2'
    case 'mastered': return '\u2B50'
  }
}
