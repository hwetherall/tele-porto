'use client'

import { useState, useRef, useCallback } from 'react'

export type RecorderState = 'idle' | 'recording' | 'processing' | 'error'

interface UseVoiceRecorderReturn {
  state: RecorderState
  startRecording: () => Promise<void>
  stopRecording: () => Promise<Blob | null>
  transcript: string | null
  error: string | null
  transcribe: (blob: Blob) => Promise<string | null>
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [state, setState] = useState<RecorderState>('idle')
  const [transcript, setTranscript] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setTranscript(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.start(100)
      setState('recording')
    } catch (err) {
      setError('Microphone access denied')
      setState('error')
    }
  }, [])

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder || recorder.state === 'inactive') {
        resolve(null)
        return
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        // Stop all tracks
        recorder.stream.getTracks().forEach((t) => t.stop())
        mediaRecorderRef.current = null
        setState('idle')
        resolve(blob)
      }

      recorder.stop()
    })
  }, [])

  const transcribe = useCallback(async (blob: Blob): Promise<string | null> => {
    setState('processing')
    try {
      const formData = new FormData()
      formData.append('audio', blob, 'recording.webm')

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Transcription failed')

      const data = await res.json()
      const text = data.transcript ?? null
      setTranscript(text)
      setState('idle')
      return text
    } catch (err) {
      setError('Transcription failed')
      setState('error')
      return null
    }
  }, [])

  return { state, startRecording, stopRecording, transcript, error, transcribe }
}
