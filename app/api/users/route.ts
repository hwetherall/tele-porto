import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

// GET /api/users — fetch both Harry and Ky stats for leaderboard
export async function GET() {
  try {
    const supabase = createServiceClient()
    const today = new Date().toISOString().split('T')[0]

    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, xp, level, streak_count, last_active')
      .in('name', ['Harry', 'Ky'])

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const result = (users ?? []).map((u: {
      id: string
      name: string
      xp: number
      level: number
      streak_count: number
      last_active: string | null
    }) => ({
      ...u,
      practicedToday: u.last_active === today,
    }))

    return NextResponse.json({ success: true, users: result })
  } catch (error) {
    console.error('Users route error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
