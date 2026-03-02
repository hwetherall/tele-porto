'use client'

import { useState } from 'react'
import Link from 'next/link'
import LevelUpToast from '@/components/ui/LevelUpToast'
import type { ReviewStats } from './ReviewSession'

interface SessionSummaryProps {
  stats: ReviewStats
  userName: string
  onReviewAgain: () => void
}

const BOX_LABELS: Record<number, string> = {
  1: 'New', 2: 'Box 2', 3: 'Box 3', 4: 'Box 4', 5: 'Box 5', 6: 'Mastered',
}

const ENCOURAGEMENT = [
  { pt: 'Muito bem!', en: 'Very well done!' },
  { pt: 'Excelente trabalho!', en: 'Excellent work!' },
  { pt: 'Você está indo muito bem!', en: "You're doing great!" },
  { pt: 'Parabéns!', en: 'Congratulations!' },
  { pt: 'Ótimo progresso!', en: 'Great progress!' },
]

export default function SessionSummary({ stats, userName, onReviewAgain }: SessionSummaryProps) {
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
  const phrase = ENCOURAGEMENT[Math.floor(Math.random() * ENCOURAGEMENT.length)]
  const [showToast, setShowToast] = useState(stats.leveledUp ?? false)

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8 text-center animate-bounce-in">
      {showToast && stats.newLevel && (
        <LevelUpToast newLevel={stats.newLevel} onDismiss={() => setShowToast(false)} />
      )}

      <div className="text-6xl">{stats.leveledUp ? '🏆' : '🎉'}</div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Session Complete!</h2>
        <p className="text-porto-green-600 font-semibold text-lg">{phrase.pt}</p>
        <p className="text-gray-500 text-sm">{phrase.en}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">Cards reviewed</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-porto-green-600">{accuracy}%</div>
          <div className="text-xs text-gray-500 mt-1">Accuracy</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-porto-gold-600">+{stats.xpEarned}</div>
          <div className="text-xs text-gray-500 mt-1">XP earned</div>
        </div>
      </div>

      {/* Detail */}
      <div className="flex gap-6 text-sm">
        <span className="text-porto-green-600">
          <span className="font-bold">{stats.correct}</span> correct
        </span>
        <span className="text-red-500">
          <span className="font-bold">{stats.incorrect}</span> to review again
        </span>
      </div>

      {/* Quest completion bonus */}
      {stats.questCompleted && (
        <div className="w-full max-w-xs card bg-porto-gold-50 border-porto-gold-200 flex items-center gap-3 py-3">
          <span className="text-2xl">⭐</span>
          <div className="text-left">
            <p className="font-semibold text-porto-gold-700 text-sm">Daily Quest Complete!</p>
            <p className="text-xs text-porto-gold-600">+20 XP bonus earned</p>
          </div>
        </div>
      )}

      {/* Promoted cards */}
      {stats.promotedCards && stats.promotedCards.length > 0 && (
        <div className="w-full max-w-xs">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            🎓 {stats.promotedCards.length} phrase{stats.promotedCards.length > 1 ? 's' : ''} moved up!
          </p>
          <div className="space-y-2">
            {stats.promotedCards.map((card, i) => (
              <div key={i} className="card py-2 px-3 flex items-center justify-between gap-2">
                <div className="text-left min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{card.portuguese}</p>
                  <p className="text-xs text-gray-500 truncate">{card.english}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-xs">
                  <span className="text-gray-400 line-through">{BOX_LABELS[card.oldBox]}</span>
                  <span className="text-gray-400">→</span>
                  <span className={`font-semibold ${card.newBox === 6 ? 'text-porto-gold-600' : 'text-porto-green-600'}`}>
                    {BOX_LABELS[card.newBox]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {stats.incorrect > 0 && (
          <button onClick={onReviewAgain} className="btn-primary w-full">
            Review missed cards
          </button>
        )}
        <Link href="/scenarios" className="btn-secondary w-full text-center block py-3">
          Try a scenario 🎭
        </Link>
        <Link href="/learn" className="btn-ghost w-full text-center block py-3">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
