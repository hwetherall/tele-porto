'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useActiveUser } from '@/lib/hooks/useActiveUser'
import { createClient } from '@/lib/supabase'
import type { Scenario, User } from '@/lib/types'

const WEDDING_DATE = new Date('2026-09-20')
function getDaysToWedding(): number {
  const diff = WEDDING_DATE.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

const PACK_CONFIG = {
  household: {
    label: 'Conversas com Mychelle',
    emoji: '🏠',
    description: 'Practice with your nanny Mychelle from São Paulo',
    color: 'bg-green-50 border-green-200',
    headerColor: 'bg-green-100 text-green-800',
  },
  work: {
    label: 'No trabalho com o Felipe',
    emoji: '💼',
    description: 'Professional chats with your colleague Felipe from Salvador',
    color: 'bg-blue-50 border-blue-200',
    headerColor: 'bg-blue-100 text-blue-800',
  },
  wedding: {
    label: 'O casamento em Ericeira',
    emoji: '💒',
    description: 'Prepare for the September wedding in Ericeira, Portugal',
    color: 'bg-pink-50 border-pink-200',
    headerColor: 'bg-pink-100 text-pink-800',
  },
} as const

export default function ScenariosPage() {
  const { user, isLoaded } = useActiveUser()
  const router = useRouter()
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && !user) router.push('/')
  }, [isLoaded, user, router])

  useEffect(() => {
    if (!user) return

    const load = async () => {
      const supabase = createClient()

      const [{ data: userRow }, { data: scenarioRows }] = await Promise.all([
        supabase.from('users').select('*').eq('name', user).single(),
        supabase.from('scenarios').select('*').order('pack').order('title'),
      ])

      if (userRow) setUserData(userRow as User)
      if (scenarioRows) setScenarios(scenarioRows as Scenario[])
      setLoading(false)
    }

    load()
  }, [user])

  if (!isLoaded || !user) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-4xl animate-pulse">🎭</div>
      </div>
    )
  }

  const userLevel = userData?.level ?? 1
  const packs = (['household', 'work', 'wedding'] as const)
  const daysToWedding = getDaysToWedding()
  const weddingUrgent = daysToWedding > 0 && daysToWedding <= 60

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scenarios</h1>
        <p className="text-gray-500 text-sm mt-1">
          Real conversations from your life, in Portuguese
        </p>
        {weddingUrgent && (
          <div className="mt-3 bg-pink-100 border border-pink-300 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">🎊</span>
            <div>
              <p className="font-semibold text-pink-800 text-sm">Wedding in {daysToWedding} days!</p>
              <p className="text-xs text-pink-600">Focus on the Ericeira pack — it&apos;s crunch time</p>
            </div>
          </div>
        )}
      </div>

      {packs.map((pack) => {
        const config = PACK_CONFIG[pack]
        const packScenarios = scenarios.filter((s) => s.pack === pack)
        const isFeatured = pack === 'wedding' && weddingUrgent

        return (
          <div key={pack} className={`rounded-2xl border-2 ${isFeatured ? 'border-pink-400 bg-pink-50 ring-2 ring-pink-300 ring-offset-2' : config.color} overflow-hidden`}>
            {/* Pack header */}
            <div className={`px-4 py-3 ${isFeatured ? 'bg-pink-200 text-pink-900' : config.headerColor} flex items-center gap-2`}>
              <span className="text-xl">{config.emoji}</span>
              <div className="flex-1">
                <h2 className="font-bold text-sm">{config.label}</h2>
                <p className="text-xs opacity-70">{config.description}</p>
              </div>
              {isFeatured && (
                <span className="text-xs bg-pink-500 text-white font-semibold px-2 py-0.5 rounded-full shrink-0">
                  ⭐ Featured
                </span>
              )}
            </div>

            {/* Scenarios */}
            <div className="divide-y divide-gray-100">
              {packScenarios.map((scenario) => {
                const isLocked = scenario.unlock_level > userLevel
                return (
                  <div key={scenario.id} className="bg-white">
                    {isLocked ? (
                      <div className="px-4 py-4 flex items-center justify-between opacity-60">
                        <div className="flex-1">
                          <p className="font-medium text-gray-700">🔒 {scenario.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{scenario.description}</p>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full ml-3">
                          Level {scenario.unlock_level}
                        </span>
                      </div>
                    ) : (
                      <Link
                        href={`/scenarios/${scenario.id}`}
                        className="block px-4 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{scenario.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{scenario.description}</p>
                          </div>
                          <span className="text-gray-400 ml-3">→</span>
                        </div>
                      </Link>
                    )}
                  </div>
                )
              })}

              {packScenarios.length === 0 && (
                <div className="bg-white px-4 py-4 text-sm text-gray-400">
                  No scenarios yet — add them via Supabase.
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
