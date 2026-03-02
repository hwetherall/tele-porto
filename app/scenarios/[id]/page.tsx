'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useActiveUser } from '@/lib/hooks/useActiveUser'
import { createClient } from '@/lib/supabase'
import ChatInterface from '@/components/scenarios/ChatInterface'
import type { Scenario, User } from '@/lib/types'

const XP_PER_SCENARIO = 50

export default function ScenarioPage() {
  const { user, isLoaded } = useActiveUser()
  const router = useRouter()
  const params = useParams()
  const scenarioId = params.id as string

  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (isLoaded && !user) router.push('/')
  }, [isLoaded, user, router])

  useEffect(() => {
    if (!user || !scenarioId) return

    const load = async () => {
      const supabase = createClient()
      const [{ data: scenarioRow }, { data: userRow }] = await Promise.all([
        supabase.from('scenarios').select('*').eq('id', scenarioId).single(),
        supabase.from('users').select('*').eq('name', user).single(),
      ])

      if (!scenarioRow) {
        router.push('/scenarios')
        return
      }

      setScenario(scenarioRow as Scenario)
      if (userRow) setUserData(userRow as User)
      setLoading(false)
    }

    load()
  }, [user, scenarioId, router])

  const handleSessionEnd = async (messageCount: number) => {
    if (!userData || messageCount < 2) {
      router.push('/scenarios')
      return
    }

    // Log session
    await fetch('/api/session-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userData.id,
        cardsReviewed: 0,
        cardsCorrect: 0,
        xpEarned: XP_PER_SCENARIO,
        scenarioPlayed: scenario?.title,
      }),
    })

    setCompleted(true)
  }

  if (!isLoaded || !user || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-4xl animate-pulse">🎭</div>
      </div>
    )
  }

  if (!scenario) return null

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="text-6xl">🎊</div>
        <h2 className="text-2xl font-bold text-gray-900">Muito bem!</h2>
        <p className="text-gray-600">You completed &ldquo;{scenario.title}&rdquo;</p>
        <div className="card bg-porto-gold-50 border-porto-gold-200 py-6">
          <div className="text-3xl font-bold text-porto-gold-600">+{XP_PER_SCENARIO} XP</div>
          <div className="text-sm text-gray-500 mt-1">Scenario complete</div>
        </div>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button
            onClick={() => setCompleted(false)}
            className="btn-primary"
          >
            Practice again
          </button>
          <button
            onClick={() => router.push('/scenarios')}
            className="btn-ghost"
          >
            Back to scenarios
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <button
          onClick={() => router.push('/scenarios')}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-gray-900 text-sm">{scenario.title}</h1>
          <p className="text-xs text-gray-400 capitalize">{scenario.pack} pack</p>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          scenario={scenario}
          onSessionEnd={handleSessionEnd}
        />
      </div>
    </div>
  )
}
