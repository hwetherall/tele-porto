import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

interface CompleteExerciseBody {
  userId: string
  lessonId: string
  conceptTags: string[]
  correct: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: CompleteExerciseBody = await request.json()
    const { userId, lessonId, conceptTags, correct } = body

    if (!userId || !lessonId || !conceptTags?.length) {
      return NextResponse.json(
        { success: false, error: 'userId, lessonId, and conceptTags are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Update concept scores for each tag
    for (const tag of conceptTags) {
      // Try to upsert the concept score
      const { data: existing } = await supabase
        .from('tutor_concept_scores')
        .select('id, times_tested, times_correct')
        .eq('user_id', userId)
        .eq('concept_tag', tag)
        .single()

      if (existing) {
        await supabase
          .from('tutor_concept_scores')
          .update({
            times_tested: existing.times_tested + 1,
            times_correct: existing.times_correct + (correct ? 1 : 0),
            last_updated: new Date().toISOString(),
          })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('tutor_concept_scores')
          .insert({
            user_id: userId,
            concept_tag: tag,
            times_tested: 1,
            times_correct: correct ? 1 : 0,
            last_updated: new Date().toISOString(),
          })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Complete exercise error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
