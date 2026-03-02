'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import PhraseCard from './PhraseCard'
import type { SRCardWithPhrase } from '@/lib/types'

interface ReviewSessionProps {
  cards: SRCardWithPhrase[]
  userId: string
  onComplete: (stats: ReviewStats) => void
  onBack: () => void
  questBonus?: boolean
}

export interface PromotedCard {
  portuguese: string
  english: string
  newBox: number
  oldBox: number
}

export interface ReviewStats {
  total: number
  correct: number
  incorrect: number
  xpEarned: number
  leveledUp?: boolean
  newLevel?: number
  promotedCards?: PromotedCard[]
  questCompleted?: boolean
}

const QUEST_BONUS_XP = 20

export default function ReviewSession({ cards, userId, onComplete, onBack, questBonus = false }: ReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [key, setKey] = useState(0) // Force re-render of PhraseCard
  const promotedCardsRef = useRef<PromotedCard[]>([])

  const currentCard = cards[currentIndex]
  const isFinished = currentIndex >= cards.length

  const updateCard = useCallback(
    async (cardId: string, wasCorrect: boolean, oldBox: number, phrase: { portuguese: string; english: string }) => {
      try {
        const res = await fetch('/api/sr-cards', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardId, correct: wasCorrect }),
        })
        const data = await res.json()
        if (data.success && data.data?.box > oldBox) {
          promotedCardsRef.current = [
            ...promotedCardsRef.current,
            { portuguese: phrase.portuguese, english: phrase.english, newBox: data.data.box, oldBox },
          ]
        }
      } catch (err) {
        console.error('Failed to update card:', err)
      }
    },
    []
  )

  const handleRate = useCallback(
    async (wasCorrect: boolean) => {
      if (isSubmitting) return
      setIsSubmitting(true)

      if (wasCorrect) setCorrect((c) => c + 1)
      else setIncorrect((i) => i + 1)

      await updateCard(
        currentCard.id,
        wasCorrect,
        currentCard.box,
        { portuguese: currentCard.phrase.portuguese, english: currentCard.phrase.english }
      )

      setIsSubmitting(false)
      setCurrentIndex((i) => i + 1)
      setKey((k) => k + 1)
    },
    [currentCard, isSubmitting, updateCard]
  )

  useEffect(() => {
    if (isFinished) {
      const baseXP = correct * 10 + incorrect * 5
      const xpEarned = baseXP + (questBonus ? QUEST_BONUS_XP : 0)
      // Log session and check for level-up
      fetch('/api/session-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          cardsReviewed: cards.length,
          cardsCorrect: correct,
          xpEarned,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          onComplete({
            total: cards.length,
            correct,
            incorrect,
            xpEarned,
            leveledUp: data.leveledUp ?? false,
            newLevel: data.newLevel,
            promotedCards: promotedCardsRef.current,
            questCompleted: questBonus,
          })
        })
        .catch(() => {
          onComplete({
            total: cards.length,
            correct,
            incorrect,
            xpEarned,
            promotedCards: promotedCardsRef.current,
            questCompleted: questBonus,
          })
        })
    }
  }, [isFinished]) // eslint-disable-line react-hooks/exhaustive-deps

  if (isFinished) return null

  const progress = (currentIndex / cards.length) * 100

  return (
    <div className="flex flex-col gap-6 px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-sm">
          ← Back
        </button>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {cards.length}
        </span>
        <div className="flex gap-3 text-sm">
          <span className="text-porto-green-600 font-medium">✓ {correct}</span>
          <span className="text-red-500 font-medium">✗ {incorrect}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-porto-green-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card */}
      <PhraseCard
        key={key}
        card={currentCard}
        onCorrect={() => handleRate(true)}
        onIncorrect={() => handleRate(false)}
      />
    </div>
  )
}
