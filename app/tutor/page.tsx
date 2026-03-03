'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useActiveUser } from '@/lib/hooks/useActiveUser'
import { createClient } from '@/lib/supabase'
import { tutorLessons } from '@/data/tutor-lessons'
import { getMasteryTier, getMasteryBadge } from '@/lib/types'
import type { TutorProgress, TutorConceptScore } from '@/lib/types'

export default function TutorPage() {
  const { user, isLoaded } = useActiveUser()
  const [userId, setUserId] = useState<string | null>(null)
  const [progress, setProgress] = useState<TutorProgress[]>([])
  const [conceptScores, setConceptScores] = useState<TutorConceptScore[]>([])
  const [recommendedLesson, setRecommendedLesson] = useState<string>('estar-intro')
  const [recommendationReason, setRecommendationReason] = useState<string>('Start your first lesson!')
  const [showConcepts, setShowConcepts] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch userId from Supabase
  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('users')
      .select('id')
      .eq('name', user)
      .single()
      .then(({ data }) => {
        if (data) setUserId(data.id)
      })
  }, [user])

  const fetchProgress = useCallback(async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/tutor/progress?userId=${userId}`)
      const data = await res.json()
      if (data.success) {
        setProgress(data.lessons)
        setConceptScores(data.conceptScores)
        setRecommendedLesson(data.recommendedLesson)
        setRecommendationReason(data.recommendationReason)
      }
    } catch (err) {
      console.error('Failed to fetch tutor progress:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  const progressMap = new Map(progress.map(p => [p.lesson_id, p]))
  const completedSet = new Set(progress.filter(p => p.completed).map(p => p.lesson_id))

  function isLessonUnlocked(lessonId: string): boolean {
    const lesson = tutorLessons.find(l => l.id === lessonId)
    if (!lesson) return false
    if (!lesson.unlockedBy) return true
    return completedSet.has(lesson.unlockedBy)
  }

  const recommendedLessonData = tutorLessons.find(l => l.id === recommendedLesson)

  return (
    <div className="max-w-2xl mx-auto px-4 pt-20 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tutor</h1>
        <p className="text-gray-500 mt-1">Learn the Big Five verbs before you practise them</p>
      </div>

      {/* Recommended Lesson */}
      {recommendedLessonData && (
        <Link href={`/tutor/${recommendedLesson}`}>
          <div className="card mb-6 border-2 border-porto-gold-400 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-porto-gold-100 rounded-full -translate-y-8 translate-x-8 opacity-50" />
            <div className="relative">
              <span className="badge bg-porto-gold-100 text-porto-gold-700 mb-2">
                Recommended for you
              </span>
              <h2 className="text-lg font-bold text-gray-900 mt-1">
                {recommendedLessonData.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{recommendationReason}</p>
              <div className="mt-3 inline-flex items-center text-sm font-semibold text-porto-green-600">
                Start lesson &rarr;
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Lesson Map */}
      <h2 className="text-lg font-bold text-gray-900 mb-3">Lesson Map</h2>
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-28">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-8">
          {tutorLessons.map((lesson) => {
            const prog = progressMap.get(lesson.id)
            const unlocked = isLessonUnlocked(lesson.id)
            const completed = prog?.completed
            const isRecommended = lesson.id === recommendedLesson

            // Find weakest concept for this lesson
            const lessonConcepts = conceptScores.filter(c =>
              lesson.conceptTags.includes(c.concept_tag)
            )
            const weakest = lessonConcepts
              .filter(c => c.mastery_pct < 70)
              .sort((a, b) => a.mastery_pct - b.mastery_pct)[0]

            return (
              <Link
                key={lesson.id}
                href={unlocked ? `/tutor/${lesson.id}` : '#'}
                className={!unlocked ? 'pointer-events-none' : ''}
              >
                <div
                  className={`card h-full transition-all duration-200 ${
                    isRecommended
                      ? 'ring-2 ring-porto-gold-400 ring-offset-2'
                      : ''
                  } ${
                    !unlocked
                      ? 'opacity-50 bg-gray-50'
                      : 'hover:shadow-md active:scale-[0.98]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-medium text-gray-400">
                      Lesson {lesson.lessonOrder}
                    </span>
                    <span className="text-lg">
                      {!unlocked ? '\uD83D\uDD12' : completed ? '\u2705' : '\u26AA'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                    {lesson.title}
                  </h3>
                  {prog && prog.completed && (
                    <p className="text-xs text-gray-500 mt-1">
                      {prog.score}/{prog.max_score} correct
                    </p>
                  )}
                  {weakest && unlocked && (
                    <p className="text-xs text-red-500 mt-1">
                      {getMasteryBadge(weakest.mastery_pct)}{' '}
                      {weakest.concept_tag.replace(/-/g, ' ')}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Concept Mastery Panel */}
      <div className="card">
        <button
          onClick={() => setShowConcepts(!showConcepts)}
          className="w-full flex items-center justify-between text-left"
        >
          <h2 className="text-lg font-bold text-gray-900">Concept Mastery</h2>
          <span className="text-sm font-medium text-porto-green-600">
            {showConcepts ? 'Hide' : 'See concept breakdown \u2192'}
          </span>
        </button>

        {showConcepts && (
          <div className="mt-4 space-y-2">
            {conceptScores.length === 0 ? (
              <p className="text-sm text-gray-500">
                Complete your first lesson to see concept scores.
              </p>
            ) : (
              [...conceptScores]
                .sort((a, b) => a.mastery_pct - b.mastery_pct)
                .map((concept) => {
                  const tier = getMasteryTier(concept.mastery_pct)
                  const tierColors: Record<string, string> = {
                    struggling: 'bg-red-50 text-red-700',
                    'getting-there': 'bg-yellow-50 text-yellow-700',
                    solid: 'bg-green-50 text-green-700',
                    mastered: 'bg-porto-gold-50 text-porto-gold-700',
                  }

                  return (
                    <div
                      key={concept.concept_tag}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span>{getMasteryBadge(concept.mastery_pct)}</span>
                        <span className="text-sm text-gray-700">
                          {concept.concept_tag.replace(/-/g, ' ')}
                        </span>
                      </div>
                      <span className={`badge ${tierColors[tier]}`}>
                        {concept.mastery_pct}%
                      </span>
                    </div>
                  )
                })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
