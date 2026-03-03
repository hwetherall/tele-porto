'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useActiveUser } from '@/lib/hooks/useActiveUser'
import { createClient } from '@/lib/supabase'
import { tutorLessons, type Exercise } from '@/data/tutor-lessons'

type Phase = 'explanation' | 'exercises' | 'complete'

interface ExerciseResult {
  exercise: Exercise
  correct: boolean
  attempts: number
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.lessonId as string
  const lesson = tutorLessons.find(l => l.id === lessonId)

  const { user, isLoaded } = useActiveUser()
  const [userId, setUserId] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('explanation')
  const [currentExercise, setCurrentExercise] = useState(0)
  const [results, setResults] = useState<ExerciseResult[]>([])
  const [xpEarned, setXpEarned] = useState(0)

  // Exercise state
  const [inputValue, setInputValue] = useState('')
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'incorrect' | 'show-answer'>('idle')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [attemptCount, setAttemptCount] = useState(0)
  const [checking, setChecking] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch userId
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

  const exercise = lesson?.exercises[currentExercise]
  const totalExercises = lesson?.exercises.length ?? 0

  const recordExercise = useCallback(async (ex: Exercise, correct: boolean) => {
    if (!userId || !lessonId) return
    try {
      await fetch('/api/tutor/complete-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          lessonId,
          conceptTags: ex.conceptTags,
          correct,
        }),
      })
    } catch (err) {
      console.error('Failed to record exercise:', err)
    }
  }, [userId, lessonId])

  const completeLesson = useCallback(async (finalResults: ExerciseResult[]) => {
    if (!userId || !lessonId) return
    const score = finalResults.filter(r => r.correct).length
    const maxScore = finalResults.length
    try {
      const res = await fetch('/api/tutor/complete-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, lessonId, score, maxScore }),
      })
      const data = await res.json()
      if (data.success) {
        setXpEarned(data.xpEarned)
      }
    } catch (err) {
      console.error('Failed to complete lesson:', err)
    }
  }, [userId, lessonId])

  function resetExerciseState() {
    setInputValue('')
    setSelectedOption(null)
    setFeedbackState('idle')
    setFeedbackMessage('')
    setAttemptCount(0)
    setChecking(false)
  }

  function moveToNext(correct: boolean) {
    if (!exercise) return

    const result: ExerciseResult = {
      exercise,
      correct,
      attempts: attemptCount + 1,
    }

    recordExercise(exercise, correct)

    const newResults = [...results, result]
    setResults(newResults)

    if (currentExercise < totalExercises - 1) {
      resetExerciseState()
      setCurrentExercise(currentExercise + 1)
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      completeLesson(newResults)
      setPhase('complete')
    }
  }

  async function handleSubmit() {
    if (!exercise || checking) return

    if (exercise.type === 'multiple-choice') {
      if (selectedOption === null) return
      const correct = selectedOption === exercise.correctIndex
      if (correct) {
        setFeedbackState('correct')
        setFeedbackMessage('Correct!')
        setTimeout(() => moveToNext(true), 800)
      } else {
        const newAttempts = attemptCount + 1
        setAttemptCount(newAttempts)
        if (newAttempts >= 2) {
          setFeedbackState('show-answer')
          setFeedbackMessage(`The answer is: ${exercise.options[exercise.correctIndex]}`)
          setTimeout(() => moveToNext(false), 1500)
        } else {
          setFeedbackState('incorrect')
          setFeedbackMessage('Try again!')
          setSelectedOption(null)
          setTimeout(() => setFeedbackState('idle'), 1000)
        }
      }
      return
    }

    if (exercise.type === 'fill-blank') {
      const userAnswer = inputValue.trim().toLowerCase()
      const correctAnswer = exercise.answer.toLowerCase()
      const correct = userAnswer === correctAnswer
      if (correct) {
        setFeedbackState('correct')
        setFeedbackMessage('Correct!')
        setTimeout(() => moveToNext(true), 800)
      } else {
        const newAttempts = attemptCount + 1
        setAttemptCount(newAttempts)
        if (newAttempts >= 2) {
          setFeedbackState('show-answer')
          setFeedbackMessage(`The answer is: ${exercise.answer}`)
          setTimeout(() => moveToNext(false), 1500)
        } else {
          setFeedbackState('incorrect')
          setFeedbackMessage('Try again!')
          setInputValue('')
          setTimeout(() => {
            setFeedbackState('idle')
            inputRef.current?.focus()
          }, 1000)
        }
      }
      return
    }

    if (exercise.type === 'translate') {
      setChecking(true)
      try {
        const res = await fetch('/api/tutor/check-translation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userAnswer: inputValue.trim(),
            expectedAnswer: exercise.expectedAnswer,
          }),
        })
        const data = await res.json()
        if (data.correct) {
          setFeedbackState('correct')
          setFeedbackMessage(data.feedback || 'Correct!')
          setTimeout(() => moveToNext(true), 800)
        } else {
          const newAttempts = attemptCount + 1
          setAttemptCount(newAttempts)
          if (newAttempts >= 2) {
            setFeedbackState('show-answer')
            setFeedbackMessage(`Expected: ${exercise.expectedAnswer}`)
            setTimeout(() => moveToNext(false), 2000)
          } else {
            setFeedbackState('incorrect')
            setFeedbackMessage(data.feedback || 'Try again!')
            setInputValue('')
            setTimeout(() => {
              setFeedbackState('idle')
              inputRef.current?.focus()
            }, 1500)
          }
        }
      } catch {
        setFeedbackState('incorrect')
        setFeedbackMessage('Could not check answer. Try again.')
        setTimeout(() => setFeedbackState('idle'), 1500)
      } finally {
        setChecking(false)
      }
    }
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-gray-500 mb-4">Lesson not found.</p>
        <button onClick={() => router.push('/tutor')} className="btn-primary">
          Back to Tutor
        </button>
      </div>
    )
  }

  // ========== PHASE 1: EXPLANATION ==========
  if (phase === 'explanation') {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-24">
        {/* Back link */}
        <button
          onClick={() => router.push('/tutor')}
          className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
        >
          &larr; Back to Tutor
        </button>

        <div className="mb-2">
          <span className="badge bg-porto-green-50 text-porto-green-700">
            Lesson {lesson.lessonOrder} of 10
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{lesson.title}</h1>

        {/* Explanation body */}
        <div className="card mb-4">
          <p className="text-gray-700 leading-relaxed">{lesson.explanation.body}</p>
        </div>

        {/* Conjugation table */}
        {lesson.explanation.conjugationTable && (
          <div className="card mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {lesson.explanation.conjugationTable.headers.map((h, i) => (
                    <th key={i} className="text-left py-2 px-3 text-gray-500 font-medium border-b border-gray-100">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lesson.explanation.conjugationTable.rows.map((row, i) => (
                  <tr key={i}>
                    <td className="py-2 px-3 font-medium text-gray-900">{row.pronoun}</td>
                    <td className="py-2 px-3 text-porto-green-700 font-semibold">{row.form}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Examples */}
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Examples</h3>
          <div className="space-y-3">
            {lesson.explanation.examples.map((ex, i) => (
              <div key={i} className="flex flex-col">
                <span className="font-semibold text-gray-900">{ex.portuguese}</span>
                <span className="text-sm text-gray-500">{ex.english}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setPhase('exercises')
            setTimeout(() => inputRef.current?.focus(), 100)
          }}
          className="btn-primary w-full"
        >
          Got it &rarr;
        </button>
      </div>
    )
  }

  // ========== PHASE 2: EXERCISES ==========
  if (phase === 'exercises' && exercise) {
    const progressPercent = ((currentExercise) / totalExercises) * 100

    return (
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-24">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">
              Exercise {currentExercise + 1} of {totalExercises}
            </span>
            <button
              onClick={() => router.push('/tutor')}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Exit
            </button>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-porto-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Exercise card */}
        <div className="card mb-6">
          {/* Fill in the blank */}
          {exercise.type === 'fill-blank' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Fill in the blank
              </h3>
              <p className="text-lg font-medium text-gray-900 mb-4">
                {exercise.sentence}
              </p>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Type your answer..."
                disabled={feedbackState !== 'idle'}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-porto-green-500 focus:border-transparent disabled:bg-gray-50"
                autoComplete="off"
                autoCapitalize="none"
              />
            </div>
          )}

          {/* Multiple choice */}
          {exercise.type === 'multiple-choice' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Choose the correct answer
              </h3>
              <p className="text-lg font-medium text-gray-900 mb-4">
                {exercise.prompt}
              </p>
              <div className="space-y-2">
                {exercise.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => feedbackState === 'idle' && setSelectedOption(i)}
                    disabled={feedbackState !== 'idle'}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 text-base ${
                      selectedOption === i
                        ? feedbackState === 'correct'
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : feedbackState === 'incorrect' || feedbackState === 'show-answer'
                          ? 'border-red-500 bg-red-50 text-red-800'
                          : 'border-porto-green-500 bg-porto-green-50 text-porto-green-800'
                        : feedbackState === 'show-answer' && i === exercise.correctIndex
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Translate */}
          {exercise.type === 'translate' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Translate to Portuguese
              </h3>
              <p className="text-lg font-medium text-gray-900 mb-4">
                &ldquo;{exercise.english}&rdquo;
              </p>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Type your translation..."
                disabled={feedbackState !== 'idle' || checking}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-porto-green-500 focus:border-transparent disabled:bg-gray-50"
                autoComplete="off"
                autoCapitalize="none"
              />
            </div>
          )}
        </div>

        {/* Feedback */}
        {feedbackState !== 'idle' && (
          <div
            className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium animate-slide-up ${
              feedbackState === 'correct'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : feedbackState === 'show-answer'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {feedbackState === 'correct' ? '\u2713 ' : feedbackState === 'show-answer' ? '' : '\u2717 '}
            {feedbackMessage}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={
            feedbackState !== 'idle' ||
            checking ||
            (exercise.type === 'multiple-choice' && selectedOption === null) ||
            (exercise.type !== 'multiple-choice' && !inputValue.trim())
          }
          className="btn-primary w-full"
        >
          {checking ? 'Checking...' : 'Check Answer'}
        </button>
      </div>
    )
  }

  // ========== PHASE 3: COMPLETE ==========
  if (phase === 'complete') {
    const correctCount = results.filter(r => r.correct).length
    const totalCount = results.length
    const isPerfect = correctCount === totalCount

    // Group results by concept
    const conceptResults = new Map<string, { tested: number; correct: number }>()
    for (const r of results) {
      for (const tag of r.exercise.conceptTags) {
        const existing = conceptResults.get(tag) || { tested: 0, correct: 0 }
        existing.tested++
        if (r.correct) existing.correct++
        conceptResults.set(tag, existing)
      }
    }

    return (
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-24">
        {/* Celebration */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{isPerfect ? '\uD83C\uDF89' : '\uD83C\uDFC6'}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isPerfect ? 'Perfect Score!' : 'Lesson Complete!'}
          </h1>
          <p className="text-gray-500">{lesson.title}</p>
        </div>

        {/* Score card */}
        <div className="card mb-4 text-center">
          <div className="text-4xl font-bold text-porto-green-600 mb-1">
            {correctCount}/{totalCount}
          </div>
          <p className="text-sm text-gray-500">correct answers</p>
          <div className="mt-3 inline-flex items-center gap-1 badge bg-porto-gold-100 text-porto-gold-700 text-base px-4 py-1">
            +{xpEarned} XP
          </div>
        </div>

        {/* Concept breakdown */}
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Concept Breakdown
          </h3>
          <div className="space-y-2">
            {Array.from(conceptResults.entries()).map(([tag, stats]) => {
              const pct = Math.round((stats.correct / stats.tested) * 100)
              const nailed = pct >= 70

              return (
                <div key={tag} className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-700">
                    {tag.replace(/-/g, ' ')}
                  </span>
                  <span className={`text-sm font-semibold ${nailed ? 'text-green-600' : 'text-red-500'}`}>
                    {nailed ? '\u2713' : '\u2717'} {stats.correct}/{stats.tested}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => router.push('/tutor')}
          className="btn-primary w-full"
        >
          Back to Tutor Map
        </button>
      </div>
    )
  }

  return null
}
