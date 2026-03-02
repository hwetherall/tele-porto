'use client'

// ============================================================
// Text-to-Speech utilities (Browser Web Speech API, pt-BR)
// ============================================================

let ptBRVoice: SpeechSynthesisVoice | null = null

function getPortugueseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined') return null
  if (ptBRVoice) return ptBRVoice

  const voices = window.speechSynthesis.getVoices()
  // Prefer pt-BR, fall back to any pt voice
  ptBRVoice =
    voices.find((v) => v.lang === 'pt-BR') ||
    voices.find((v) => v.lang.startsWith('pt')) ||
    null

  return ptBRVoice
}

export function speakPortuguese(text: string, rate = 0.85): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve()
      return
    }

    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported')
      resolve()
      return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pt-BR'
    utterance.rate = rate
    utterance.pitch = 1

    // Try to use a Portuguese voice
    const voice = getPortugueseVoice()
    if (voice) utterance.voice = voice

    utterance.onend = () => resolve()
    utterance.onerror = (e) => {
      // Ignore 'interrupted' errors (caused by cancel())
      if (e.error === 'interrupted') {
        resolve()
      } else {
        reject(e)
      }
    }

    window.speechSynthesis.speak(utterance)
  })
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

// Initialise voices once they load (Chrome loads voices async)
export function initVoices() {
  if (typeof window === 'undefined') return
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      getPortugueseVoice()
    }
  }
  // Also try immediately
  getPortugueseVoice()
}
