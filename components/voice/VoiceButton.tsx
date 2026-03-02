'use client'

import { useCallback } from 'react'
import { useVoiceRecorder } from '@/lib/hooks/useVoiceRecorder'

interface VoiceButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: 'w-10 h-10 text-lg',
  md: 'w-12 h-12 text-xl',
  lg: 'w-16 h-16 text-2xl',
}

export default function VoiceButton({ onTranscript, disabled = false, size = 'md' }: VoiceButtonProps) {
  const { state, startRecording, stopRecording, transcribe, error } = useVoiceRecorder()

  const handlePointerDown = useCallback(async () => {
    if (disabled || state !== 'idle') return
    await startRecording()
  }, [disabled, state, startRecording])

  const handlePointerUp = useCallback(async () => {
    if (state !== 'recording') return
    const blob = await stopRecording()
    if (!blob) return
    const text = await transcribe(blob)
    if (text) onTranscript(text)
  }, [state, stopRecording, transcribe, onTranscript])

  const isRecording = state === 'recording'
  const isProcessing = state === 'processing'
  const sizeClass = SIZE_CLASSES[size]

  return (
    <div className="relative">
      <button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        disabled={disabled || isProcessing}
        className={`
          ${sizeClass} rounded-xl flex items-center justify-center
          transition-all duration-150 select-none touch-none
          ${isRecording
            ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-200'
            : isProcessing
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed animate-pulse'
              : disabled
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-porto-green-100 text-porto-green-700 hover:bg-porto-green-200 active:scale-95'
          }
        `}
        aria-label={isRecording ? 'Stop recording' : 'Hold to record'}
      >
        {isRecording ? '⏹' : isProcessing ? '⏳' : '🎤'}
      </button>

      {isRecording && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
      )}

      {error && (
        <p className="absolute top-full mt-1 text-xs text-red-500 whitespace-nowrap">{error}</p>
      )}
    </div>
  )
}
