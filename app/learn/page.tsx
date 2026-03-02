'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useActiveUser } from '@/lib/hooks/useActiveUser'
import { createClient } from '@/lib/supabase'
import BoxSystem from '@/components/sr/BoxSystem'
import ReviewSession from '@/components/sr/ReviewSession'
import SessionSummary from '@/components/sr/SessionSummary'
import ShadowMode from '@/components/sr/ShadowMode'
import type { SRCardWithPhrase, User } from '@/lib/types'
import Link from 'next/link'

const WEDDING_DATE = new Date('2026-09-20')
function getDaysToWedding(): number {
  const diff = WEDDING_DATE.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function getQuestKey(userName: string): string {
  const today = new Date().toISOString().split('T')[0]
  return `questDone_${userName}_${today}`
}

type ViewState = 'dashboard' | 'reviewing' | 'summary' | 'shadow'

interface DailyQuest {
  icon: string
  title: string
  description: string
  action: () => void
  actionLabel: string
  isQuestBonus: boolean
}

function getDailyQuest(
  dueCards: SRCardWithPhrase[],
  allCards: SRCardWithPhrase[],
  boxCounts: BoxCounts,
  setView: (v: ViewState) => void
): DailyQuest {
  const daysToWedding = getDaysToWedding()

  // Priority 1: due cards
  if (dueCards.length > 0) {
    const category = dueCards[0]?.phrase?.category
    const categoryLabel = category === 'big_five'
      ? 'verb cards'
      : category === 'household'
        ? 'household phrases'
        : category === 'wedding'
          ? 'wedding phrases'
          : 'cards'
    return {
      icon: '⚡',
      title: "Today's Quest",
      description: `Review your ${dueCards.length} due ${categoryLabel} to keep your streak going`,
      action: () => setView('reviewing'),
      actionLabel: 'Start →',
      isQuestBonus: true,
    }
  }

  // Priority 2: lots of box 1 cards (new, never reviewed)
  if (boxCounts[1] > 5) {
    return {
      icon: '🌱',
      title: 'New cards waiting',
      description: `You have ${boxCounts[1]} new cards to learn. Start building your deck!`,
      action: () => setView('reviewing'),
      actionLabel: 'Learn them',
      isQuestBonus: true,
    }
  }

  // Priority 2b: wedding countdown — push wedding scenarios if <60 days
  if (daysToWedding > 0 && daysToWedding <= 60 && allCards.length > 0) {
    const weddingDue = dueCards.filter((c) => c.phrase?.category === 'wedding')
    if (weddingDue.length > 0) {
      return {
        icon: '💒',
        title: 'Wedding Prep Quest',
        description: `Only ${daysToWedding} days to Ericeira! Review ${weddingDue.length} wedding phrase${weddingDue.length > 1 ? 's' : ''}.`,
        action: () => setView('reviewing'),
        actionLabel: 'Prepare →',
        isQuestBonus: true,
      }
    }
  }

  // Priority 3: shadow mode practice
  if (allCards.length > 0) {
    return {
      icon: '🎤',
      title: 'Pronunciation practice',
      description: 'All caught up on cards! Try Shadow Mode to reinforce your pronunciation.',
      action: () => setView('shadow'),
      actionLabel: 'Start Shadow',
      isQuestBonus: false,
    }
  }

  // Fallback: go drill verbs
  return {
    icon: '🎯',
    title: 'Drill the Big Five',
    description: 'Practice estar, ir, ter, querer, fazer — the verbs you need most.',
    action: () => {},
    actionLabel: 'Go drill',
    isQuestBonus: false,
  }
}

interface BoxCounts {
  1: number; 2: number; 3: number; 4: number; 5: number; 6: number
}

function emptyBoxCounts(): BoxCounts {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
}

export default function LearnPage() {
  const { user, isLoaded } = useActiveUser()
  const router = useRouter()
  const [userData, setUserData] = useState<User | null>(null)
  const [allCards, setAllCards] = useState<SRCardWithPhrase[]>([])
  const [dueCards, setDueCards] = useState<SRCardWithPhrase[]>([])
  const [boxCounts, setBoxCounts] = useState<BoxCounts>(emptyBoxCounts())
  const [dueByBox, setDueByBox] = useState<BoxCounts>(emptyBoxCounts())
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewState>('dashboard')
  const [sessionStats, setSessionStats] = useState<import('@/components/sr/ReviewSession').ReviewStats | null>(null)
  const [questDone, setQuestDone] = useState(false)
  const [isQuestBonus, setIsQuestBonus] = useState(false)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/')
    }
  }, [isLoaded, user, router])

  // Check if today's quest is already done
  useEffect(() => {
    if (user) {
      const done = localStorage.getItem(getQuestKey(user)) === 'true'
      setQuestDone(done)
    }
  }, [user])

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    // Fetch user row
    const { data: userRow } = await supabase
      .from('users')
      .select('*')
      .eq('name', user)
      .single()

    const typedUserRow = userRow as User | null
    if (typedUserRow) setUserData(typedUserRow)

    // Fetch all SR cards with phrases for this user
    const { data: cards } = await supabase
      .from('sr_cards')
      .select('*, phrase:phrases(*)')
      .eq('user_id', typedUserRow?.id ?? '')

    if (cards) {
      const typed = cards as unknown as SRCardWithPhrase[]
      setAllCards(typed)

      // Compute box counts
      const counts = emptyBoxCounts()
      const dueCounts = emptyBoxCounts()
      const due: SRCardWithPhrase[] = []

      for (const card of typed) {
        const box = card.box as 1 | 2 | 3 | 4 | 5 | 6
        counts[box]++
        if (card.next_review <= today) {
          dueCounts[box]++
          due.push(card)
        }
      }

      setBoxCounts(counts)
      setDueByBox(dueCounts)
      setDueCards(due)
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (!isLoaded || !user) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">🇵🇹</div>
          <p className="text-gray-500">Loading your cards...</p>
        </div>
      </div>
    )
  }

  if (view === 'reviewing' && dueCards.length > 0 && userData) {
    return (
      <div className="max-w-2xl mx-auto pt-4 pb-24">
        <ReviewSession
          cards={dueCards}
          userId={userData.id}
          questBonus={isQuestBonus && !questDone}
          onComplete={(stats) => {
            // Mark quest done in localStorage if it had a bonus
            if (stats.questCompleted && user) {
              localStorage.setItem(getQuestKey(user), 'true')
              setQuestDone(true)
            }
            setSessionStats(stats)
            setView('summary')
          }}
          onBack={() => setView('dashboard')}
        />
      </div>
    )
  }

  if (view === 'shadow' && allCards.length > 0) {
    // Pick cards that are in boxes 2-5 (not brand new, not mastered)
    const shadowCards = allCards.filter((c) => c.box >= 2 && c.box <= 5).slice(0, 10)
    const pool = shadowCards.length >= 3 ? shadowCards : allCards.slice(0, 10)
    return (
      <div className="max-w-2xl mx-auto pt-4 pb-24">
        <ShadowMode cards={pool} onExit={() => setView('dashboard')} />
      </div>
    )
  }

  if (view === 'summary' && sessionStats && userData) {
    return (
      <div className="max-w-2xl mx-auto pt-4 pb-24">
        <SessionSummary
          stats={sessionStats}
          userName={user}
          onReviewAgain={() => {
            loadData()
            setView('reviewing')
          }}
        />
      </div>
    )
  }

  const xp = userData?.xp ?? 0
  const level = userData?.level ?? 1
  const streak = userData?.streak_count ?? 0
  const quest = getDailyQuest(dueCards, allCards, boxCounts, setView)
  const isDrillQuest = quest.icon === '🎯'

  function handleQuestAction() {
    setIsQuestBonus(quest.isQuestBonus)
    quest.action()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* User header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {user}! 👋
          </h1>
          <p className="text-gray-500 text-sm">
            {dueCards.length > 0
              ? `${dueCards.length} cards due for review`
              : 'All caught up for today!'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-porto-gold-600">Level {level}</div>
          <div className="text-xs text-gray-500">{xp} XP</div>
          {streak > 0 && (
            <div className="text-xs text-orange-500">🔥 {streak} day streak</div>
          )}
        </div>
      </div>

      {/* Daily Quest */}
      <div className={`card border-2 ${questDone
        ? 'bg-porto-green-50 border-porto-green-400'
        : 'bg-gradient-to-r from-porto-green-50 to-porto-gold-50 border-porto-green-200'
      }`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">{questDone ? '✅' : quest.icon}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {questDone ? 'Quest Complete!' : quest.title}
            </h3>
            <p className="text-sm text-gray-600 mt-0.5">
              {questDone
                ? "You've earned your daily XP bonus. Come back tomorrow!"
                : quest.description}
            </p>
            {quest.isQuestBonus && !questDone && (
              <p className="text-xs text-porto-gold-600 font-medium mt-1">+20 XP bonus on completion</p>
            )}
          </div>
          {!questDone && (
            isDrillQuest ? (
              <Link
                href="/drill"
                className="btn-primary py-2 px-4 text-sm whitespace-nowrap"
              >
                {quest.actionLabel}
              </Link>
            ) : (
              <button
                onClick={handleQuestAction}
                className="btn-primary py-2 px-4 text-sm whitespace-nowrap"
              >
                {quest.actionLabel}
              </button>
            )
          )}
        </div>
      </div>

      {/* Box system */}
      <BoxSystem
        counts={boxCounts}
        dueByBox={dueByBox}
        onStartReview={() => setView('reviewing')}
      />

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <a href="/drill" className="card hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center py-5 gap-2">
          <span className="text-3xl">🎯</span>
          <span className="font-semibold text-gray-900">Big Five Drill</span>
          <span className="text-xs text-gray-500 text-center">Practice the 5 essential verbs</span>
        </a>
        <a href="/scenarios" className="card hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center py-5 gap-2">
          <span className="text-3xl">🎭</span>
          <span className="font-semibold text-gray-900">Scenarios</span>
          <span className="text-xs text-gray-500 text-center">AI conversation practice</span>
        </a>
        {allCards.length > 0 && (
          <button
            onClick={() => setView('shadow')}
            className="card hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center py-5 gap-2 col-span-2"
          >
            <span className="text-3xl">🎤</span>
            <span className="font-semibold text-gray-900">Shadow Mode</span>
            <span className="text-xs text-gray-500 text-center">Listen & repeat phrases aloud</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Your Progress</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-gray-900">{allCards.length}</div>
            <div className="text-xs text-gray-500">Total cards</div>
          </div>
          <div>
            <div className="text-xl font-bold text-porto-green-600">{boxCounts[6]}</div>
            <div className="text-xs text-gray-500">Mastered</div>
          </div>
          <div>
            <div className="text-xl font-bold text-porto-gold-600">{xp}</div>
            <div className="text-xs text-gray-500">Total XP</div>
          </div>
        </div>
      </div>
    </div>
  )
}
