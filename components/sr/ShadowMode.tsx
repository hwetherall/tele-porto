'use client'

import { useState, useCallback, useEffect } from 'react'
import { speakPortuguese } from '@/lib/tts'
import VoiceButton from '@/components/voice/VoiceButton'
import type { SRCardWithPhrase } from '@/lib/types'

interface ShadowModeProps {
  cards: SRCardWithPhrase[]
  onExit: () => void
}

type PhaseState = 'speaking' | 'waiting' | 'result' | 'done'

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function scoreMatch(expected: string, heard: string): number {
  const expWords = normalizeText(expected).split(' ').filter(Boolean)
  const heardWords = normalizeText(heard).split(' ').filter(Boolean)
  if (expWords.length === 0) return 0
  let matched = 0
  for (const word of expWords) {
    if (heardWords.includes(word)) matched++
  }
  return Math.round((matched / expWords.length) * 100)
}

function ScoreBadge({ score }: { score: number }) {
  if (score >= 80) return <span className="text-porto-green-600 font-bold text-2xl">✅ {score}% — Perfeito!</span>
  if (score >= 50) return <span className="text-porto-gold-600 font-bold text-2xl">⚡ {score}% — Quase lá!</span>
  return <span className="text-red-500 font-bold text-2xl">🔄 {score}% — Tente de novo</span>
}

export default function ShadowMode({ cards, onExit }: ShadowModeProps) {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<PhaseState>('speaking')
  const [heard, setHeard] = useState<string | null>(null)
  const [score, setScore] = useState<number | null>(null)
  const [speaking, setSpeaking] = useState(false)
  const [streak, setStreak] = useState(0)

  const currentCard = cards[index]

  const speakCurrent = useCallback(async () => {
    if (!currentCard) return
    setSpeaking(true)
    try {
      await speakPortuguese(currentCard.phrase.portuguese)
    } catch (_) {
      // ignore TTS errors
    }
    setSpeaking(false)
    setPhase('waiting')
  }, [currentCard])

  // Auto-speak when phrase loads
  useEffect(() => {
    setPhase('speaking')
    setHeard(null)
    setScore(null)
    setSpeaking(false)
    const timer = setTimeout(() => {
      speakCurrent()
    }, 400)
    return () => clearTimeout(timer)
  }, [index]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTranscript = useCallback(
    (text: string) => {
      if (!currentCard) return
      const s = scoreMatch(currentCard.phrase.portuguese, text)
      setHeard(text)
      setScore(s)
      setPhase('result')
      if (s >= 50) setStreak((p) => p + 1)
      else setStreak(0)
    },
    [currentCard]
  )

  const handleNext = useCallback(() => {
    if (index + 1 >= cards.length) {
      setPhase('done')
    } else {
      setIndex((i) => i + 1)
    }
  }, [index, cards.length])

  const handleTryAgain = useCallback(() => {
    setHeard(null)
    setScore(null)
    setPhase('speaking')
    setTimeout(() => speakCurrent(), 300)
  }, [speakCurrent])

  if (!currentCard || phase === 'done') {
    return (
      <div className="flex flex-col items-center gap-6 px-4 py-8 text-center">
        <div className="text-6xl">🎤</div>
        <h2 className="text-2xl font-bold text-gray-900">Shadow session complete!</h2>
        <p className="text-gray-500">
          You practised {cards.length} phrase{cards.length !== 1 ? 's' : ''}
        </p>
        {streak > 1 && (
          <p className="text-porto-gold-600 font-semibold">🔥 {streak} in a row!</p>
        )}
        <button onClick={onExit} className="btn-primary w-full max-w-xs">
          Back to learning
        </button>
      </div>
    )
  }

  const { phrase } = currentCard

  return (
    <div className="flex flex-col gap-5 px-4 py-4 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="text-gray-500 hover:text-gray-700 text-sm">
          ← Exit
        </button>
        <span className="text-sm font-medium text-gray-400">
          {index + 1} / {cards.length}
        </span>
        {streak > 0 && (
          <span className="text-xs text-orange-500 font-medium">🔥 {streak}</span>
        )}
      </div>

      {/* Instruction */}
      <div className="text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Shadow Mode</p>
        <p className="text-sm text-gray-500">
          {phase === 'speaking'
            ? 'Listen carefully…'
            : phase === 'waiting'
              ? 'Now repeat it out loud'
              : 'How did you do?'}
        </p>
      </div>

      {/* English hint */}
      <div className="text-center text-gray-400 text-sm italic">
        &ldquo;{phrase.english}&rdquo;
      </div>

      {/* Portuguese phrase — revealed after hearing it once */}
      <div
        className={`card min-h-[100px] flex flex-col items-center justify-center text-center gap-3 transition-all ${
          phase === 'speaking' ? 'opacity-30' : ''
        }`}
      >
        <p className="text-2xl font-bold text-porto-green-800">{phrase.portuguese}</p>
        <button
          onClick={speakCurrent}
          disabled={speaking || phase === 'speaking'}
          className="text-porto-green-600 text-sm flex items-center gap-1 hover:text-porto-green-700 disabled:opacity-30 transition-opacity"
        >
          <span>{speaking ? '🔊' : '🔈'}</span>
          {speaking ? 'Playing…' : 'Hear again'}
        </button>
      </div>

      {/* Record button */}
      {phase === 'waiting' && (
        <div className="flex flex-col items-center gap-3">
          <VoiceButton onTranscript={handleTranscript} size="lg" />
          <p className="text-xs text-gray-400">Hold to record · release to check</p>
        </div>
      )}

      {/* Result */}
      {phase === 'result' && score !== null && (
        <div className="space-y-4 animate-slide-up">
          <div className="text-center">
            <ScoreBadge score={score} />
          </div>

          <div className="card bg-gray-50 space-y-2 text-sm">
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wide">Expected</span>
              <p className="font-medium text-gray-800 mt-0.5">{phrase.portuguese}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wide">You said</span>
              <p className="text-gray-600 mt-0.5">{heard || '(nothing detected)'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleTryAgain}
              className="btn-secondary py-3 text-sm"
            >
              🔄 Try again
            </button>
            <button
              onClick={handleNext}
              className="btn-primary py-3 text-sm"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
