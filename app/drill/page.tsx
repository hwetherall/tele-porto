'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useActiveUser } from '@/lib/hooks/useActiveUser'
import { speakPortuguese } from '@/lib/tts'
import { useVoiceRecorder } from '@/lib/hooks/useVoiceRecorder'

// ============================================================
// Big Five Verb Conjugations
// ============================================================

interface Conjugation {
  pronoun: string
  pronounEn: string
  form: string
  meaning: string
}

interface Verb {
  infinitive: string
  english: string
  emoji: string
  note: string
  conjugations: Conjugation[]
}

const BIG_FIVE: Verb[] = [
  {
    infinitive: 'estar',
    english: 'to be (temporary)',
    emoji: '📍',
    note: 'Use for feelings, locations, and temporary states',
    conjugations: [
      { pronoun: 'eu', pronounEn: 'I', form: 'estou', meaning: 'I am' },
      { pronoun: 'você', pronounEn: 'you', form: 'está', meaning: 'you are' },
      { pronoun: 'ele/ela', pronounEn: 'he/she', form: 'está', meaning: 'he/she is' },
      { pronoun: 'nós', pronounEn: 'we', form: 'estamos', meaning: 'we are' },
      { pronoun: 'vocês', pronounEn: 'you all', form: 'estão', meaning: 'you all are' },
      { pronoun: 'eles/elas', pronounEn: 'they', form: 'estão', meaning: 'they are' },
    ],
  },
  {
    infinitive: 'ir',
    english: 'to go',
    emoji: '🚶',
    note: 'Also used for future: "vou fazer" = I\'m going to do',
    conjugations: [
      { pronoun: 'eu', pronounEn: 'I', form: 'vou', meaning: 'I go / I\'m going' },
      { pronoun: 'você', pronounEn: 'you', form: 'vai', meaning: 'you go' },
      { pronoun: 'ele/ela', pronounEn: 'he/she', form: 'vai', meaning: 'he/she goes' },
      { pronoun: 'nós', pronounEn: 'we', form: 'vamos', meaning: 'we go / let\'s go' },
      { pronoun: 'vocês', pronounEn: 'you all', form: 'vão', meaning: 'you all go' },
      { pronoun: 'eles/elas', pronounEn: 'they', form: 'vão', meaning: 'they go' },
    ],
  },
  {
    infinitive: 'ter',
    english: 'to have',
    emoji: '✋',
    note: '"ter fome" = to be hungry (lit. to have hunger)',
    conjugations: [
      { pronoun: 'eu', pronounEn: 'I', form: 'tenho', meaning: 'I have' },
      { pronoun: 'você', pronounEn: 'you', form: 'tem', meaning: 'you have' },
      { pronoun: 'ele/ela', pronounEn: 'he/she', form: 'tem', meaning: 'he/she has' },
      { pronoun: 'nós', pronounEn: 'we', form: 'temos', meaning: 'we have' },
      { pronoun: 'vocês', pronounEn: 'you all', form: 'têm', meaning: 'you all have' },
      { pronoun: 'eles/elas', pronounEn: 'they', form: 'têm', meaning: 'they have' },
    ],
  },
  {
    infinitive: 'querer',
    english: 'to want',
    emoji: '💚',
    note: 'Polite requests: "Eu queria..." (I would like...)',
    conjugations: [
      { pronoun: 'eu', pronounEn: 'I', form: 'quero', meaning: 'I want' },
      { pronoun: 'você', pronounEn: 'you', form: 'quer', meaning: 'you want' },
      { pronoun: 'ele/ela', pronounEn: 'he/she', form: 'quer', meaning: 'he/she wants' },
      { pronoun: 'nós', pronounEn: 'we', form: 'queremos', meaning: 'we want' },
      { pronoun: 'vocês', pronounEn: 'you all', form: 'querem', meaning: 'you all want' },
      { pronoun: 'eles/elas', pronounEn: 'they', form: 'querem', meaning: 'they want' },
    ],
  },
  {
    infinitive: 'fazer',
    english: 'to do / to make',
    emoji: '🔨',
    note: '"O que você vai fazer?" = What are you going to do?',
    conjugations: [
      { pronoun: 'eu', pronounEn: 'I', form: 'faço', meaning: 'I do/make' },
      { pronoun: 'você', pronounEn: 'you', form: 'faz', meaning: 'you do/make' },
      { pronoun: 'ele/ela', pronounEn: 'he/she', form: 'faz', meaning: 'he/she does/makes' },
      { pronoun: 'nós', pronounEn: 'we', form: 'fazemos', meaning: 'we do/make' },
      { pronoun: 'vocês', pronounEn: 'you all', form: 'fazem', meaning: 'you all do/make' },
      { pronoun: 'eles/elas', pronounEn: 'they', form: 'fazem', meaning: 'they do/make' },
    ],
  },
]

// Levenshtein distance for fuzzy matching
function similarity(a: string, b: string): number {
  const normalize = (s: string) => s.toLowerCase().trim().replace(/[.,!?]/g, '')
  return normalize(a) === normalize(b) ? 1 : 0
}

type DrillMode = 'select' | 'drilling' | 'table' | 'complete'

interface DrillState {
  verbIndex: number
  conjugationIndex: number
  score: number
  total: number
  lastCorrect: boolean | null
  userAnswer: string
  answered: boolean
}

export default function DrillPage() {
  const { user, isLoaded } = useActiveUser()
  const router = useRouter()
  const [mode, setMode] = useState<DrillMode>('select')
  const [selectedVerb, setSelectedVerb] = useState<Verb | null>(null)
  const [drill, setDrill] = useState<DrillState>({
    verbIndex: 0,
    conjugationIndex: 0,
    score: 0,
    total: 0,
    lastCorrect: null,
    userAnswer: '',
    answered: false,
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const { state: recorderState, startRecording, stopRecording, transcribe } = useVoiceRecorder()

  useEffect(() => {
    if (isLoaded && !user) router.push('/')
  }, [isLoaded, user, router])

  const startDrill = useCallback((verb: Verb) => {
    setSelectedVerb(verb)
    setDrill({
      verbIndex: 0,
      conjugationIndex: 0,
      score: 0,
      total: 0,
      lastCorrect: null,
      userAnswer: '',
      answered: false,
    })
    setMode('drilling')
    // Speak the prompt
    const conj = verb.conjugations[0]
    speakPortuguese(`${verb.infinitive}. ${conj.pronoun}`)
  }, [])

  const checkAnswer = useCallback(() => {
    if (!selectedVerb || drill.answered) return

    const conj = selectedVerb.conjugations[drill.conjugationIndex]
    const correct = similarity(drill.userAnswer, conj.form) === 1 ||
      drill.userAnswer.toLowerCase().trim() === conj.form.toLowerCase()

    setDrill((prev) => ({
      ...prev,
      score: prev.score + (correct ? 1 : 0),
      total: prev.total + 1,
      lastCorrect: correct,
      answered: true,
    }))

    if (correct) {
      speakPortuguese(conj.form)
    }
  }, [selectedVerb, drill])

  const nextConjugation = useCallback(() => {
    if (!selectedVerb) return

    const nextIndex = drill.conjugationIndex + 1

    if (nextIndex >= selectedVerb.conjugations.length) {
      // Verb complete — show table
      setMode('table')
      return
    }

    const nextConj = selectedVerb.conjugations[nextIndex]
    setDrill((prev) => ({
      ...prev,
      conjugationIndex: nextIndex,
      lastCorrect: null,
      userAnswer: '',
      answered: false,
    }))

    speakPortuguese(`${nextConj.pronoun}: ${selectedVerb.infinitive}`)
    inputRef.current?.focus()
  }, [selectedVerb, drill])

  const handleVoiceRecord = useCallback(async () => {
    if (recorderState === 'recording') {
      const blob = await stopRecording()
      if (!blob) return
      const text = await transcribe(blob)
      if (text) {
        setDrill((prev) => ({ ...prev, userAnswer: text }))
      }
    } else {
      await startRecording()
    }
  }, [recorderState, startRecording, stopRecording, transcribe])

  if (!isLoaded || !user) return null

  // ─── Verb Selection ────────────────────────────────────────
  if (mode === 'select') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Big Five Drill</h1>
          <p className="text-gray-500 text-sm mt-1">
            Master the 5 verbs that cover 70% of conversation
          </p>
        </div>

        <div className="space-y-3">
          {BIG_FIVE.map((verb) => (
            <button
              key={verb.infinitive}
              onClick={() => startDrill(verb)}
              className="card w-full text-left hover:shadow-md transition-all active:scale-98 group"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{verb.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-gray-900 text-lg">{verb.infinitive}</span>
                    <span className="text-gray-500 text-sm">— {verb.english}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{verb.note}</p>
                </div>
                <span className="text-gray-300 group-hover:text-gray-500 text-xl transition-colors">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─── Conjugation Table (after completing a verb) ──────────
  if (mode === 'table' && selectedVerb) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
        <div className="text-center">
          <span className="text-4xl">{selectedVerb.emoji}</span>
          <h2 className="text-xl font-bold text-gray-900 mt-2">
            {selectedVerb.infinitive} — Complete!
          </h2>
          <p className="text-porto-green-600 font-medium mt-1">
            {drill.score}/{drill.total} correct
          </p>
        </div>

        <div className="card overflow-hidden p-0">
          <div className="bg-porto-green-600 text-white px-4 py-3 flex items-center gap-2">
            <span>{selectedVerb.emoji}</span>
            <span className="font-bold">{selectedVerb.infinitive}</span>
            <span className="text-porto-green-200 text-sm">— {selectedVerb.english}</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-2 text-left">Pronoun</th>
                <th className="px-4 py-2 text-left">Portuguese</th>
                <th className="px-4 py-2 text-left">English</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {selectedVerb.conjugations.map((conj) => (
                <tr key={conj.pronoun} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <span className="font-medium text-gray-700">{conj.pronoun}</span>
                    <span className="text-gray-400 text-xs ml-1">({conj.pronounEn})</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-porto-green-700">{conj.form}</span>
                      <button
                        onClick={() => speakPortuguese(`${conj.pronoun} ${conj.form}`)}
                        className="text-xs text-gray-300 hover:text-gray-500"
                      >
                        🔈
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{conj.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => startDrill(selectedVerb)}
            className="btn-primary"
          >
            Drill again
          </button>
          <button
            onClick={() => setMode('select')}
            className="btn-ghost"
          >
            Choose another verb
          </button>
        </div>
      </div>
    )
  }

  // ─── Drilling ─────────────────────────────────────────────
  if (mode === 'drilling' && selectedVerb) {
    const conj = selectedVerb.conjugations[drill.conjugationIndex]
    const progress = (drill.conjugationIndex / selectedVerb.conjugations.length) * 100

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => setMode('select')} className="text-gray-400 text-sm">← Exit</button>
          <div className="text-sm text-gray-500">
            {drill.conjugationIndex + 1} / {selectedVerb.conjugations.length}
          </div>
          <div className="text-sm font-medium text-porto-green-600">
            {drill.score} correct
          </div>
        </div>

        {/* Progress */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-porto-green-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Prompt card */}
        <div className="card text-center py-8 space-y-3">
          <p className="text-sm text-gray-400 uppercase tracking-wider">{selectedVerb.infinitive}</p>
          <p className="text-4xl font-bold text-gray-900">{conj.pronoun}</p>
          <p className="text-gray-500 text-sm">{conj.pronounEn}</p>
          <button
            onClick={() => speakPortuguese(`${conj.pronoun}: ${selectedVerb.infinitive}`)}
            className="text-porto-green-600 text-sm hover:text-porto-green-700"
          >
            🔈 Hear prompt
          </button>
        </div>

        {/* Feedback */}
        {drill.answered && drill.lastCorrect !== null && (
          <div className={`card text-center py-4 ${
            drill.lastCorrect
              ? 'bg-porto-green-50 border-porto-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            {drill.lastCorrect ? (
              <>
                <p className="text-2xl mb-1">✅</p>
                <p className="font-bold text-porto-green-700">{conj.form}</p>
                <p className="text-sm text-porto-green-600">{conj.meaning}</p>
              </>
            ) : (
              <>
                <p className="text-2xl mb-1">❌</p>
                <p className="text-sm text-red-600 mb-1">
                  You said: <span className="font-medium">{drill.userAnswer || '(nothing)'}</span>
                </p>
                <p className="font-bold text-gray-700">{conj.form}</p>
                <p className="text-sm text-gray-500">{conj.meaning}</p>
              </>
            )}
          </div>
        )}

        {/* Input */}
        {!drill.answered && (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={drill.userAnswer}
              onChange={(e) => setDrill((prev) => ({ ...prev, userAnswer: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') checkAnswer()
              }}
              placeholder={`${conj.pronoun} ___`}
              className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-center text-lg font-semibold text-gray-900 placeholder-gray-300 outline-none focus:ring-2 focus:ring-porto-green-500"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <button
              onClick={handleVoiceRecord}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
                recorderState === 'recording'
                  ? 'bg-red-500 text-white'
                  : 'bg-porto-green-100 text-porto-green-700'
              }`}
            >
              {recorderState === 'recording' ? '⏹' : '🎤'}
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div>
          {!drill.answered ? (
            <button
              onClick={checkAnswer}
              disabled={!drill.userAnswer.trim()}
              className="btn-primary w-full"
            >
              Check →
            </button>
          ) : (
            <button onClick={nextConjugation} className="btn-primary w-full">
              {drill.conjugationIndex + 1 < selectedVerb.conjugations.length
                ? 'Next →'
                : 'See full table →'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return null
}
