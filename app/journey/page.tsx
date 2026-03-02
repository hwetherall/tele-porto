'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useActiveUser } from '@/lib/hooks/useActiveUser'
import { createClient } from '@/lib/supabase'
import type { User } from '@/lib/types'
import { LEVEL_THRESHOLDS } from '@/lib/types'

const JOURNEY_STOPS = [
  {
    id: 1,
    name: 'London',
    emoji: '🏙️',
    subtitle: 'The beginning',
    unlockLevel: 1,
    description: 'Every great journey begins at home. You\'ve started learning Portuguese!',
    xpRequired: 0,
  },
  {
    id: 2,
    name: 'Lisbon',
    emoji: '🌉',
    subtitle: 'Capital of Portugal',
    unlockLevel: 2,
    description: 'The beautiful Portuguese capital. Pastéis de nata, fado music, and the Tejo river.',
    xpRequired: 200,
  },
  {
    id: 3,
    name: 'Sintra',
    emoji: '🏰',
    subtitle: 'Fairy-tale palaces',
    unlockLevel: 3,
    description: 'Magical palaces in the hills. The Wedding Pack is now unlocked!',
    xpRequired: 500,
  },
  {
    id: 4,
    name: 'Cascais',
    emoji: '⛵',
    subtitle: 'Seaside town',
    unlockLevel: 4,
    description: 'A charming coastal town just west of Lisbon. Almost there!',
    xpRequired: 1000,
  },
  {
    id: 5,
    name: 'Ericeira',
    emoji: '🎊',
    subtitle: 'The wedding!',
    unlockLevel: 5,
    description: 'You made it! The wedding in Ericeira awaits. Parabéns!',
    xpRequired: 2000,
  },
]

const WEDDING_DATE = new Date('2025-09-20')

function getDaysToWedding(): number {
  const today = new Date()
  const diff = WEDDING_DATE.getTime() - today.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function JourneyPage() {
  const { user, isLoaded } = useActiveUser()
  const router = useRouter()
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const daysToWedding = getDaysToWedding()

  useEffect(() => {
    if (isLoaded && !user) router.push('/')
  }, [isLoaded, user, router])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('users').select('*').eq('name', user).single()
      if (data) setUserData(data as User)
      setLoading(false)
    }
    load()
  }, [user])

  if (!isLoaded || !user || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-4xl animate-pulse">🗺️</div>
      </div>
    )
  }

  const xp = userData?.xp ?? 0
  const currentLevel = userData?.level ?? 1
  const currentStop = JOURNEY_STOPS.findLast((s) => s.unlockLevel <= currentLevel) ?? JOURNEY_STOPS[0]

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user}&apos;s Road to Ericeira
          </h1>
          <p className="text-gray-500 text-sm mt-1">Level {currentLevel} · {xp} XP</p>
        </div>
        {daysToWedding > 0 && (
          <div className="bg-porto-gold-100 border border-porto-gold-300 rounded-xl px-3 py-2 text-center">
            <div className="text-2xl font-bold text-porto-gold-700">{daysToWedding}</div>
            <div className="text-xs text-porto-gold-600">days to go</div>
          </div>
        )}
      </div>

      {/* Journey map */}
      <div className="relative">
        {/* Connection line */}
        <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-200 z-0" />

        <div className="space-y-4 relative z-10">
          {JOURNEY_STOPS.map((stop, i) => {
            const isUnlocked = stop.unlockLevel <= currentLevel
            const isCurrent = stop.id === currentStop.id
            const xpNeeded = stop.xpRequired - xp

            return (
              <div
                key={stop.id}
                className={`flex gap-4 items-start ${!isUnlocked ? 'opacity-50' : ''}`}
              >
                {/* Location marker */}
                <div
                  className={`
                    relative z-10 w-16 h-16 rounded-2xl flex flex-col items-center justify-center
                    flex-shrink-0 border-2 transition-all
                    ${isCurrent
                      ? 'bg-porto-green-600 border-porto-green-600 text-white shadow-lg scale-110'
                      : isUnlocked
                        ? 'bg-white border-porto-green-300 text-porto-green-600'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }
                  `}
                >
                  <span className="text-2xl">{stop.emoji}</span>
                  {isCurrent && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-porto-gold-500 rounded-full border-2 border-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-bold text-gray-900">{stop.name}</h3>
                    {isCurrent && (
                      <span className="text-xs bg-porto-green-100 text-porto-green-700 px-2 py-0.5 rounded-full font-medium">
                        You are here
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{stop.subtitle}</p>
                  {isUnlocked ? (
                    <p className="text-sm text-gray-600">{stop.description}</p>
                  ) : (
                    <p className="text-sm text-gray-400">
                      Reach Level {stop.unlockLevel} · {xpNeeded > 0 ? `${xpNeeded} more XP needed` : 'Almost there!'}
                    </p>
                  )}

                  {/* XP progress bar for next stop */}
                  {isCurrent && i < JOURNEY_STOPS.length - 1 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{xp} XP</span>
                        <span>{JOURNEY_STOPS[i + 1].xpRequired} XP needed</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-porto-green-500 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (xp / JOURNEY_STOPS[i + 1].xpRequired) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Level info */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Level Thresholds</h3>
        <div className="space-y-2">
          {Object.entries(LEVEL_THRESHOLDS).map(([level, threshold]) => (
            <div key={level} className="flex items-center justify-between text-sm">
              <span className={`font-medium ${parseInt(level) <= currentLevel ? 'text-porto-green-600' : 'text-gray-400'}`}>
                Level {level} {parseInt(level) === currentLevel && '← you'}
              </span>
              <span className={parseInt(level) <= currentLevel ? 'text-gray-700' : 'text-gray-300'}>
                {threshold} XP
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
