'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useActiveUser } from '@/lib/hooks/useActiveUser'
import type { UserName } from '@/lib/types'

const WEDDING_DATE = new Date('2026-09-20') // Ericeira wedding date — update as needed

function getDaysToWedding(): number {
  const today = new Date()
  const diff = WEDDING_DATE.getTime() - today.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

interface UserStats {
  name: string
  xp: number
  level: number
  streak_count: number
  practicedToday: boolean
}

interface UserCardProps {
  name: UserName
  emoji: string
  color: string
  stats: UserStats | undefined
  onSelect: (name: UserName) => void
}

function UserCard({ name, emoji, color, stats, onSelect }: UserCardProps) {
  return (
    <button
      onClick={() => onSelect(name)}
      className={`
        w-full flex flex-col items-center gap-3 p-6 rounded-3xl
        border-2 ${color}
        active:scale-95 transition-all duration-150
        shadow-lg hover:shadow-xl relative
      `}
    >
      {stats?.practicedToday && (
        <span className="absolute top-2 right-2 text-xs bg-porto-green-500 text-white rounded-full px-2 py-0.5 font-medium">
          ✓ Today
        </span>
      )}
      <span className="text-6xl">{emoji}</span>
      <span className="text-xl font-bold text-gray-900">{name}</span>
      {stats && (
        <div className="flex gap-3 text-xs text-gray-500">
          <span>Lv {stats.level}</span>
          <span>·</span>
          <span>{stats.xp} XP</span>
          {stats.streak_count > 0 && (
            <>
              <span>·</span>
              <span className="text-orange-500">🔥 {stats.streak_count}</span>
            </>
          )}
        </div>
      )}
      <span className="text-xs text-gray-400">Tap to start</span>
    </button>
  )
}

export default function HomePage() {
  const { user, switchUser, isLoaded } = useActiveUser()
  const router = useRouter()
  const [daysToWedding] = useState(getDaysToWedding())
  const [usersStats, setUsersStats] = useState<UserStats[]>([])

  useEffect(() => {
    if (isLoaded && user) {
      router.push('/learn')
    }
  }, [isLoaded, user, router])

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((d) => { if (d.success) setUsersStats(d.users) })
      .catch(() => {})
  }, [])

  if (!isLoaded || user) return null

  const harry = usersStats.find((u) => u.name === 'Harry')
  const ky = usersStats.find((u) => u.name === 'Ky')
  const householdStreakActive = harry?.practicedToday && ky?.practicedToday
  const xpGap = harry && ky ? Math.abs(harry.xp - ky.xp) : null
  const leader = harry && ky ? (harry.xp >= ky.xp ? 'Harry' : 'Ky') : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-porto-green-600 to-porto-green-800 flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-white">
        <div className="text-6xl mb-3">🇵🇹</div>
        <h1 className="text-4xl font-bold mb-2 text-center">Tele-Porto</h1>
        <p className="text-porto-green-100 text-center text-base mb-3">
          Your personalised Portuguese learning app
        </p>
        {daysToWedding > 0 && (
          <div className="bg-porto-gold-500 text-gray-900 rounded-full px-4 py-2 text-sm font-semibold">
            🎊 {daysToWedding} days to Ericeira!
          </div>
        )}

        {/* Household streak */}
        {householdStreakActive && (
          <div className="mt-3 bg-orange-500 text-white rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-2">
            🔥 Both of you practiced today! Household streak active!
          </div>
        )}

        {/* Mini leaderboard */}
        {xpGap !== null && leader && xpGap > 0 && (
          <div className="mt-3 bg-white/10 rounded-xl px-4 py-2 text-sm text-white">
            {leader} is <span className="font-bold">{xpGap} XP</span> ahead!
          </div>
        )}
      </div>

      {/* User picker */}
      <div className="bg-white rounded-t-3xl px-6 pt-8 pb-12">
        <p className="text-center text-gray-500 text-sm mb-6 font-medium uppercase tracking-wider">
          Who&apos;s learning today?
        </p>
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
          <UserCard
            name="Harry"
            emoji="👨"
            color="border-porto-green-500 bg-porto-green-50 hover:bg-porto-green-100"
            stats={harry}
            onSelect={switchUser}
          />
          <UserCard
            name="Ky"
            emoji="👩"
            color="border-porto-gold-400 bg-porto-gold-50 hover:bg-porto-gold-100"
            stats={ky}
            onSelect={switchUser}
          />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          No password needed — just tap your name
        </p>
      </div>
    </div>
  )
}
