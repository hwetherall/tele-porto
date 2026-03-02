'use client'

import { useEffect, useState } from 'react'

interface LevelUpToastProps {
  newLevel: number
  onDismiss: () => void
}

export default function LevelUpToast({ newLevel, onDismiss }: LevelUpToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Animate in
    const show = setTimeout(() => setVisible(true), 50)
    // Auto-dismiss after 4 seconds
    const hide = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 400)
    }, 4000)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [onDismiss])

  return (
    <div
      className={`
        fixed bottom-24 left-1/2 -translate-x-1/2 z-50
        bg-porto-gold-500 text-gray-900 rounded-2xl px-6 py-4
        shadow-xl flex items-center gap-3
        transition-all duration-400
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      onClick={() => { setVisible(false); setTimeout(onDismiss, 400) }}
    >
      <span className="text-3xl">🏆</span>
      <div>
        <p className="font-bold text-lg leading-tight">Level Up!</p>
        <p className="text-sm font-medium opacity-80">You reached Level {newLevel}</p>
      </div>
    </div>
  )
}
