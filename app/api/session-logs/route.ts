import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { getLevelFromXP } from '@/lib/types'

interface SessionLogBody {
  userId: string
  cardsReviewed: number
  cardsCorrect: number
  xpEarned: number
  scenarioPlayed?: string
}

/** Calculate streak from a list of session dates (YYYY-MM-DD, descending) */
function calculateStreak(dates: string[], today: string): number {
  if (!dates.length) return 0
  const unique = Array.from(new Set(dates)).sort().reverse()
  if (unique[0] !== today) return 0
  let streak = 1
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1])
    const curr = new Date(unique[i])
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000)
    if (diffDays === 1) streak++
    else break
  }
  return streak
}

// GET /api/session-logs?userId=xxx — check if household streak is active today
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const today = new Date().toISOString().split('T')[0]

    // Check if both Harry and Ky have practiced today
    const { data: users } = await supabase
      .from('users')
      .select('name, last_active, streak_count')

    const harryRow = (users ?? []).find((u: { name: string }) => u.name === 'Harry')
    const kyRow = (users ?? []).find((u: { name: string }) => u.name === 'Ky')

    const householdStreakActive =
      harryRow?.last_active === today && kyRow?.last_active === today

    return NextResponse.json({
      success: true,
      householdStreakActive,
      harry: { streak: harryRow?.streak_count ?? 0, practicedToday: harryRow?.last_active === today },
      ky: { streak: kyRow?.streak_count ?? 0, practicedToday: kyRow?.last_active === today },
    })
  } catch (error) {
    console.error('Session log GET error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/session-logs — log a completed session and update user XP + streak
export async function POST(request: NextRequest) {
  try {
    const body: SessionLogBody = await request.json()
    const { userId, cardsReviewed, cardsCorrect, xpEarned, scenarioPlayed } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const today = new Date().toISOString().split('T')[0]

    // Insert session log
    const { error: logError } = await supabase.from('session_logs').insert({
      user_id: userId,
      cards_reviewed: cardsReviewed ?? 0,
      cards_correct: cardsCorrect ?? 0,
      xp_earned: xpEarned ?? 0,
      scenario_played: scenarioPlayed ?? null,
    })

    if (logError) {
      console.error('Session log insert error:', logError)
    }

    // Fetch all session dates for this user to compute streak
    const { data: logs } = await supabase
      .from('session_logs')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    const sessionDates = (logs ?? []).map((l: { date: string }) =>
      l.date.split('T')[0]
    )
    const streak = calculateStreak(sessionDates, today)

    // Update user XP, level, streak, last_active
    const { data: user } = await supabase
      .from('users')
      .select('xp')
      .eq('id', userId)
      .single()

    let leveledUp = false
    let newLevel = 1

    if (user) {
      const oldLevel = getLevelFromXP(user.xp ?? 0)
      const newXP = (user.xp ?? 0) + (xpEarned ?? 0)
      newLevel = getLevelFromXP(newXP)
      leveledUp = newLevel > oldLevel

      await supabase
        .from('users')
        .update({
          xp: newXP,
          level: newLevel,
          streak_count: streak,
          last_active: today,
        })
        .eq('id', userId)
    }

    return NextResponse.json({ success: true, leveledUp, newLevel, streak })
  } catch (error) {
    console.error('Session log route error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
