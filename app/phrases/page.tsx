'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useActiveUser } from '@/lib/hooks/useActiveUser'
import { createClient } from '@/lib/supabase'
import { speakPortuguese } from '@/lib/tts'
import type { Phrase, User } from '@/lib/types'

export default function PhrasesPage() {
  const { user, isLoaded } = useActiveUser()
  const router = useRouter()
  const [phrases, setPhrases] = useState<Phrase[]>([])
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newEnglish, setNewEnglish] = useState('')
  const [newPortuguese, setNewPortuguese] = useState('')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'all' | 'custom'>('all')

  useEffect(() => {
    if (isLoaded && !user) router.push('/')
  }, [isLoaded, user, router])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const supabase = createClient()
      const [{ data: userRow }, { data: phraseRows }] = await Promise.all([
        supabase.from('users').select('*').eq('name', user).single(),
        supabase.from('phrases').select('*').order('category').order('portuguese'),
      ])
      if (userRow) setUserData(userRow as User)
      if (phraseRows) setPhrases(phraseRows as Phrase[])
      setLoading(false)
    }
    load()
  }, [user])

  const handleAddPhrase = useCallback(async () => {
    if (!newEnglish.trim() || !newPortuguese.trim() || !userData) return
    setSaving(true)

    const supabase = createClient()

    const { data: phrase, error } = await supabase
      .from('phrases')
      .insert({
        english: newEnglish.trim(),
        portuguese: newPortuguese.trim(),
        category: 'custom' as const,
        created_by: user ?? null,
      })
      .select()
      .single()

    if (!error && phrase) {
      // Create SR card for this user
      await supabase.from('sr_cards').insert({
        user_id: userData.id,
        phrase_id: phrase.id,
        box: 1,
        next_review: new Date().toISOString().split('T')[0],
        ease_factor: 2.5,
        interval_days: 0,
      })

      setPhrases((prev) => [phrase as Phrase, ...prev])
      setNewEnglish('')
      setNewPortuguese('')
      setAdding(false)
    }

    setSaving(false)
  }, [newEnglish, newPortuguese, userData, user])

  if (!isLoaded || !user || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-4xl animate-pulse">📝</div>
      </div>
    )
  }

  const filteredPhrases = filter === 'custom'
    ? phrases.filter((p) => p.category === 'custom' && p.created_by === user)
    : phrases

  const CATEGORY_COLORS: Record<string, string> = {
    big_five: 'bg-purple-100 text-purple-700',
    household: 'bg-green-100 text-green-700',
    work: 'bg-blue-100 text-blue-700',
    wedding: 'bg-pink-100 text-pink-700',
    custom: 'bg-yellow-100 text-yellow-700',
    general: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phrase Bank</h1>
          <p className="text-gray-500 text-sm mt-1">{filteredPhrases.length} phrases</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="btn-primary py-2 px-4 text-sm"
        >
          + Add phrase
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'custom'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f
                ? 'bg-porto-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All phrases' : 'My custom'}
          </button>
        ))}
      </div>

      {/* Add phrase form */}
      {adding && (
        <div className="card border-porto-green-200 bg-porto-green-50 space-y-3">
          <h3 className="font-semibold text-gray-900">Add a custom phrase</h3>
          <div>
            <label className="text-xs text-gray-500 font-medium">English</label>
            <input
              type="text"
              value={newEnglish}
              onChange={(e) => setNewEnglish(e.target.value)}
              placeholder="I want to go to the beach"
              className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-porto-green-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Portuguese</label>
            <input
              type="text"
              value={newPortuguese}
              onChange={(e) => setNewPortuguese(e.target.value)}
              placeholder="Eu quero ir à praia"
              className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-porto-green-500"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddPhrase}
              disabled={!newEnglish.trim() || !newPortuguese.trim() || saving}
              className="btn-primary flex-1 py-2 text-sm"
            >
              {saving ? 'Saving...' : 'Add to my deck'}
            </button>
            <button
              onClick={() => { setAdding(false); setNewEnglish(''); setNewPortuguese('') }}
              className="btn-ghost py-2 px-4 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Phrase list */}
      <div className="space-y-2">
        {filteredPhrases.map((phrase) => (
          <div key={phrase.id} className="card flex items-center gap-3">
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">{phrase.portuguese}</p>
              <p className="text-gray-500 text-xs mt-0.5">{phrase.english}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`badge text-xs ${CATEGORY_COLORS[phrase.category] ?? 'bg-gray-100 text-gray-500'}`}>
                {phrase.category}
              </span>
              <button
                onClick={() => speakPortuguese(phrase.portuguese)}
                className="text-gray-300 hover:text-porto-green-600 transition-colors"
              >
                🔈
              </button>
            </div>
          </div>
        ))}

        {filteredPhrases.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-sm">
              {filter === 'custom' ? 'No custom phrases yet. Add one above!' : 'No phrases found.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
