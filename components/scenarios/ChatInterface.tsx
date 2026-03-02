'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { speakPortuguese } from '@/lib/tts'
import { useVoiceRecorder } from '@/lib/hooks/useVoiceRecorder'
import type { ChatMessage, Scenario } from '@/lib/types'

interface ChatInterfaceProps {
  scenario: Scenario
  onSessionEnd: (messageCount: number) => void
}

interface Message extends ChatMessage {
  id: string
  translationVisible?: boolean
  translation?: string
}

export default function ChatInterface({ scenario, onSessionEnd }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { state: recorderState, startRecording, stopRecording, transcribe } = useVoiceRecorder()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return

      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: text.trim(),
      }

      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setIsLoading(true)
      setShowHint(false)

      try {
        const apiMessages: ChatMessage[] = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            systemPrompt: scenario.system_prompt,
            scenarioId: scenario.id,
          }),
        })

        const data = await res.json()

        if (data.success && data.message) {
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.message,
          }
          setMessages((prev) => [...prev, aiMsg])
          // Auto-speak the AI response
          speakPortuguese(data.message).catch(console.error)
        }
      } catch (err) {
        console.error('Chat error:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [messages, isLoading, scenario]
  )

  const handleVoiceStart = useCallback(async () => {
    await startRecording()
  }, [startRecording])

  const handleVoiceStop = useCallback(async () => {
    const blob = await stopRecording()
    if (!blob) return
    const text = await transcribe(blob)
    if (text) sendMessage(text)
  }, [stopRecording, transcribe, sendMessage])

  const toggleTranslation = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, translationVisible: !m.translationVisible } : m
      )
    )
  }, [])

  const isRecording = recorderState === 'recording'
  const isProcessing = recorderState === 'processing'

  return (
    <div className="flex flex-col h-full">
      {/* Scenario context header */}
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Scenario</p>
        <p className="text-sm text-gray-700 font-medium mt-0.5">{scenario.description}</p>
      </div>

      {/* Hint */}
      {showHint && (
        <div className="bg-porto-gold-50 border-b border-porto-gold-200 px-4 py-3">
          <p className="text-xs text-porto-gold-700 font-medium mb-1">💡 Hint</p>
          <p className="text-sm text-porto-gold-800">
            Try: <span className="font-semibold">Bom dia!</span> (Good morning!) or{' '}
            <span className="font-semibold">Como você está?</span> (How are you?)
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Start the conversation!</p>
            <p className="text-gray-300 text-xs mt-1">Type or press the mic button</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-porto-green-600 text-white rounded-br-sm'
                  : 'bg-white border border-gray-100 shadow-sm text-gray-900 rounded-bl-sm'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

              {message.role === 'assistant' && (
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => speakPortuguese(message.content)}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    🔈 Hear
                  </button>
                  <button
                    onClick={() => toggleTranslation(message.id)}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {message.translationVisible ? 'Hide' : '🇬🇧 Translate'}
                  </button>
                </div>
              )}

              {message.role === 'assistant' && message.translationVisible && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 italic">
                    [Translation coming soon — tap to get AI translation]
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 bg-white px-4 py-3 space-y-2">
        <div className="flex items-center gap-2">
          {/* Text input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(input)
              }
            }}
            placeholder="Type in Portuguese..."
            className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-porto-green-500 transition-all"
            disabled={isLoading}
          />

          {/* Voice button */}
          <button
            onPointerDown={handleVoiceStart}
            onPointerUp={handleVoiceStop}
            disabled={isLoading || isProcessing}
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all
              ${isRecording
                ? 'bg-red-500 text-white scale-110'
                : isProcessing
                  ? 'bg-gray-200 text-gray-400 animate-pulse'
                  : 'bg-porto-green-100 text-porto-green-700 hover:bg-porto-green-200'
              }
            `}
          >
            {isRecording ? '⏹' : isProcessing ? '⏳' : '🎤'}
          </button>

          {/* Send button */}
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 bg-porto-green-600 text-white rounded-xl flex items-center justify-center text-xl disabled:opacity-40 hover:bg-porto-green-700 active:scale-95 transition-all"
          >
            →
          </button>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-xs text-porto-gold-600 hover:text-porto-gold-700 font-medium"
          >
            💡 Hint
          </button>
          <button
            onClick={() => onSessionEnd(messages.length)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            End session
          </button>
        </div>
      </div>
    </div>
  )
}
