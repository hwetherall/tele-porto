'use client'

import { useState, useEffect, useCallback } from 'react'
import type { UserName } from '@/lib/types'

const STORAGE_KEY = 'activeUser'

export function useActiveUser() {
  const [user, setUser] = useState<UserName | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'Harry' || stored === 'Ky') {
      setUser(stored)
    }
    setIsLoaded(true)
  }, [])

  const switchUser = useCallback((name: UserName) => {
    localStorage.setItem(STORAGE_KEY, name)
    setUser(name)
  }, [])

  const clearUser = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  return { user, switchUser, clearUser, isLoaded }
}
