import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { XP_PER_TUTOR_LESSON, XP_BONUS_PERFECT, getLevelFromXP } from '@/lib/types'

interface CompleteLessonBody {
  userId: string
  lessonId: string
  score: number
  maxScore: number
}

export async function POST(request: NextRequest) {
  try {
    const body: CompleteLessonBody = await request.json()
    const { userId, lessonId, score, maxScore } = body

    if (!userId || !lessonId || score === undefined || maxScore === undefined) {
      return NextResponse.json(
        { success: false, error: 'userId, lessonId, score, and maxScore are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const isPerfect = score === maxScore
    const xpEarned = XP_PER_TUTOR_LESSON + (isPerfect ? XP_BONUS_PERFECT : 0)

    // Upsert tutor progress
    const { data: existing } = await supabase
      .from('tutor_progress')
      .select('id, attempts, xp_earned')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single()

    if (existing) {
      await supabase
        .from('tutor_progress')
        .update({
          completed: true,
          score,
          max_score: maxScore,
          attempts: existing.attempts + 1,
          last_attempt: new Date().toISOString(),
          xp_earned: existing.xp_earned + xpEarned,
        })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('tutor_progress')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          completed: true,
          score,
          max_score: maxScore,
          attempts: 1,
          last_attempt: new Date().toISOString(),
          xp_earned: xpEarned,
        })
    }

    // Update user XP
    const { data: user } = await supabase
      .from('users')
      .select('xp')
      .eq('id', userId)
      .single()

    let leveledUp = false
    let newLevel = 1

    if (user) {
      const oldLevel = getLevelFromXP(user.xp ?? 0)
      const newXP = (user.xp ?? 0) + xpEarned
      newLevel = getLevelFromXP(newXP)
      leveledUp = newLevel > oldLevel

      await supabase
        .from('users')
        .update({
          xp: newXP,
          level: newLevel,
          last_active: new Date().toISOString().split('T')[0],
        })
        .eq('id', userId)
    }

    return NextResponse.json({
      success: true,
      xpEarned,
      leveledUp,
      newLevel,
    })
  } catch (error) {
    console.error('Complete lesson error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
