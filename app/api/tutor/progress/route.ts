import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { tutorLessons } from '@/data/tutor-lessons'
import type { TutorProgress, TutorConceptScore } from '@/lib/types'

function getRecommendedLesson(
  lessons: TutorProgress[],
  conceptScores: TutorConceptScore[]
): string {
  const completedSet = new Set(lessons.filter(l => l.completed).map(l => l.lesson_id))
  const scoreMap = new Map(lessons.map(l => [l.lesson_id, l]))

  // If no lessons completed, start with lesson 1
  if (completedSet.size === 0) return 'estar-intro'

  // Find weakest concepts (mastery < 70%)
  const weakConcepts = conceptScores
    .filter(c => c.mastery_pct < 70)
    .sort((a, b) => a.mastery_pct - b.mastery_pct)

  // Check if all concepts are mastered (>= 85%)
  const allMastered = conceptScores.length > 0 &&
    conceptScores.every(c => c.mastery_pct >= 85)

  if (allMastered) return 'real-conversation'

  // Find lessons covering weak concepts
  if (weakConcepts.length > 0) {
    const weakTags = new Set(weakConcepts.map(c => c.concept_tag))

    for (const lesson of tutorLessons) {
      const coversWeakConcept = lesson.conceptTags.some(t => weakTags.has(t))
      if (!coversWeakConcept) continue

      const progress = scoreMap.get(lesson.id)
      // Prioritise unattempted or low-scoring lessons
      if (!progress || !progress.completed || (progress.score / progress.max_score) < 0.8) {
        // Check prerequisites
        if (!lesson.unlockedBy || completedSet.has(lesson.unlockedBy)) {
          return lesson.id
        }
      }
    }
  }

  // Find the next uncompleted lesson in order
  for (const lesson of tutorLessons) {
    if (!completedSet.has(lesson.id)) {
      if (!lesson.unlockedBy || completedSet.has(lesson.unlockedBy)) {
        return lesson.id
      }
    }
  }

  // All complete — recommend final review
  return 'real-conversation'
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId query parameter is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Fetch progress and concept scores in parallel
    const [progressResult, conceptResult] = await Promise.all([
      supabase
        .from('tutor_progress')
        .select('*')
        .eq('user_id', userId),
      supabase
        .from('tutor_concept_scores')
        .select('*')
        .eq('user_id', userId),
    ])

    const lessons: TutorProgress[] = progressResult.data ?? []
    const conceptScores: TutorConceptScore[] = conceptResult.data ?? []

    const recommendedLesson = getRecommendedLesson(lessons, conceptScores)

    // Determine recommendation reason
    let recommendationReason = 'Start your first lesson!'
    if (lessons.some(l => l.completed)) {
      const weakConcepts = conceptScores
        .filter(c => c.mastery_pct < 70)
        .sort((a, b) => a.mastery_pct - b.mastery_pct)

      if (weakConcepts.length > 0) {
        const weakTag = weakConcepts[0].concept_tag
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase())
        recommendationReason = `You struggled with ${weakTag} \u2014 let\u2019s revisit it`
      } else {
        const allMastered = conceptScores.length > 0 &&
          conceptScores.every(c => c.mastery_pct >= 85)
        if (allMastered) {
          recommendationReason = 'All concepts mastered! Try the final review.'
        } else {
          recommendationReason = 'Keep going \u2014 you\u2019re making great progress!'
        }
      }
    }

    return NextResponse.json({
      success: true,
      lessons,
      conceptScores,
      recommendedLesson,
      recommendationReason,
    })
  } catch (error) {
    console.error('Tutor progress error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
