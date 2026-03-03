// Auto-generated Supabase database types for Tele-Porto
// Regenerate with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PhraseCategory = 'household' | 'work' | 'wedding' | 'big_five' | 'custom' | 'general'
export type ScenarioPack = 'household' | 'work' | 'wedding'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          xp: number
          level: number
          streak_count: number
          last_active: string | null
          journey_stage: number
        }
        Insert: {
          id?: string
          name: string
          xp?: number
          level?: number
          streak_count?: number
          last_active?: string | null
          journey_stage?: number
        }
        Update: {
          id?: string
          name?: string
          xp?: number
          level?: number
          streak_count?: number
          last_active?: string | null
          journey_stage?: number
        }
        Relationships: []
      }
      phrases: {
        Row: {
          id: string
          portuguese: string
          english: string
          category: PhraseCategory
          audio_url: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          portuguese: string
          english: string
          category: PhraseCategory
          audio_url?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          portuguese?: string
          english?: string
          category?: PhraseCategory
          audio_url?: string | null
          created_by?: string | null
        }
        Relationships: []
      }
      sr_cards: {
        Row: {
          id: string
          user_id: string
          phrase_id: string
          box: number
          next_review: string
          ease_factor: number
          interval_days: number
          times_seen: number
          times_correct: number
        }
        Insert: {
          id?: string
          user_id: string
          phrase_id: string
          box?: number
          next_review?: string
          ease_factor?: number
          interval_days?: number
          times_seen?: number
          times_correct?: number
        }
        Update: {
          id?: string
          user_id?: string
          phrase_id?: string
          box?: number
          next_review?: string
          ease_factor?: number
          interval_days?: number
          times_seen?: number
          times_correct?: number
        }
        Relationships: []
      }
      scenarios: {
        Row: {
          id: string
          title: string
          description: string
          pack: ScenarioPack
          unlock_level: number
          system_prompt: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          pack: ScenarioPack
          unlock_level?: number
          system_prompt: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          pack?: ScenarioPack
          unlock_level?: number
          system_prompt?: string
        }
        Relationships: []
      }
      session_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          cards_reviewed: number
          cards_correct: number
          xp_earned: number
          scenario_played: string | null
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          cards_reviewed?: number
          cards_correct?: number
          xp_earned?: number
          scenario_played?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          cards_reviewed?: number
          cards_correct?: number
          xp_earned?: number
          scenario_played?: string | null
        }
        Relationships: []
      }
      tutor_lessons: {
        Row: {
          id: string
          title: string
          lesson_order: number
          concept_tags: string[]
          unlocked_by: string | null
        }
        Insert: {
          id: string
          title: string
          lesson_order: number
          concept_tags?: string[]
          unlocked_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          lesson_order?: number
          concept_tags?: string[]
          unlocked_by?: string | null
        }
        Relationships: []
      }
      tutor_progress: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed?: boolean
          score?: number
          max_score?: number
          attempts?: number
          last_attempt?: string | null
          xp_earned?: number
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          completed?: boolean
          score?: number
          max_score?: number
          attempts?: number
          last_attempt?: string | null
          xp_earned?: number
        }
        Relationships: []
      }
      tutor_concept_scores: {
        Row: {
          id: string
          user_id: string
          concept_tag: string
          times_tested: number
          times_correct: number
          mastery_pct: number
          last_updated: string | null
        }
        Insert: {
          id?: string
          user_id: string
          concept_tag: string
          times_tested?: number
          times_correct?: number
          last_updated?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          concept_tag?: string
          times_tested?: number
          times_correct?: number
          last_updated?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      phrase_category: PhraseCategory
      scenario_pack: ScenarioPack
    }
  }
}
