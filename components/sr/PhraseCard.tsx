'use client'

import { useState, useCallback } from 'react'
import { speakPortuguese } from '@/lib/tts'
import type { SRCardWithPhrase } from '@/lib/types'

interface PhraseCardProps {
  card: SRCardWithPhrase
  onCorrect: () => void
  onIncorrect: () => void
}

const CATEGORY_LABELS: Record<string, string> = {
  big_five: 'Big Five',
  household: '🏠 Household',
  work: '💼 Work',
  wedding: '💒 Wedding',
  custom: '⭐ Custom',
  general: '💬 General',
}

const CATEGORY_COLORS: Record<string, string> = {
  big_five: 'bg-purple-100 text-purple-700',
  household: 'bg-green-100 text-green-700',
  work: 'bg-blue-100 text-blue-700',
  wedding: 'bg-pink-100 text-pink-700',
  custom: 'bg-yellow-100 text-yellow-700',
  general: 'bg-gray-100 text-gray-700',
}

export default function PhraseCard({ card, onCorrect, onIncorrect }: PhraseCardProps) {
  const [revealed, setRevealed] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  const { phrase } = card

  const handleSpeak = useCallback(async () => {
    if (speaking) return
    setSpeaking(true)
    await speakPortuguese(phrase.portuguese)
    setSpeaking(false)
  }, [phrase.portuguese, speaking])

  const handleReveal = useCallback(() => {
    setRevealed(true)
    // Auto-speak when revealed
    handleSpeak()
  }, [handleSpeak])

  const handleRate = useCallback(
    (correct: boolean) => {
      if (correct) onCorrect()
      else onIncorrect()
    },
    [onCorrect, onIncorrect]
  )

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto animate-slide-up">
      {/* Category badge */}
      <div className="flex items-center justify-between">
        <span
          className={`badge ${CATEGORY_COLORS[phrase.category] ?? 'bg-gray-100 text-gray-700'}`}
        >
          {CATEGORY_LABELS[phrase.category] ?? phrase.category}
        </span>
        <span className="text-xs text-gray-400">Box {card.box}</span>
      </div>

      {/* Card front — English */}
      <div className="card min-h-[160px] flex flex-col items-center justify-center text-center gap-3 cursor-pointer select-none"
           onClick={!revealed ? handleReveal : undefined}>
        <p className="text-xl font-semibold text-gray-900">{phrase.english}</p>
        {!revealed && (
          <p className="text-sm text-gray-400 mt-2">Tap to reveal Portuguese</p>
        )}
      </div>

      {/* Card back — Portuguese (revealed) */}
      {revealed && (
        <div className="card bg-porto-green-50 border-porto-green-200 min-h-[120px] flex flex-col items-center justify-center text-center gap-3">
          <p className="text-2xl font-bold text-porto-green-800">{phrase.portuguese}</p>
          <button
            onClick={handleSpeak}
            disabled={speaking}
            className="flex items-center gap-2 text-porto-green-600 hover:text-porto-green-700 text-sm font-medium transition-colors"
          >
            <span className="text-lg">{speaking ? '🔊' : '🔈'}</span>
            {speaking ? 'Playing...' : 'Hear it again'}
          </button>
        </div>
      )}

      {/* Rating buttons */}
      {revealed && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleRate(false)}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 font-semibold text-lg active:scale-95 transition-all"
          >
            <span>👎</span> Again
          </button>
          <button
            onClick={() => handleRate(true)}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-porto-green-50 border-2 border-porto-green-300 text-porto-green-700 font-semibold text-lg active:scale-95 transition-all"
          >
            <span>👍</span> Got it!
          </button>
        </div>
      )}
    </div>
  )
}
