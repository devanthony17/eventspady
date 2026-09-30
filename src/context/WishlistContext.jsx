import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { wishlistApi } from '@api/wishlist.api'
import tokenManager from '@api/tokenManager'

const STORAGE_KEY = 'eventspady:wishlist'
const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  // Synchronize with backend wishlist on mount if authenticated
  useEffect(() => {
    if (tokenManager.hasAccessToken()) {
      wishlistApi.getWishlist().then((res) => {
        const serverIds = Array.isArray(res) ? res : res?.wishlist || res?.data || []
        const normalized = serverIds.map((item) => (typeof item === 'string' ? item : item.id || item.eventId)).filter(Boolean)
        if (normalized.length > 0) {
          setIds((prev) => Array.from(new Set([...prev, ...normalized])))
        }
      }).catch(() => {
        // Fallback silently to local storage
      })
    }
  }, [])

  // Synchronize changes to localStorage and broadcast storage event for other windows/tabs
  const updateIds = useCallback((updater) => {
    setIds((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch (e) {
        console.warn('Could not write to localStorage:', e)
      }
      return next
    })
  }, [])

  // Listen to external window/tab storage changes
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          setIds(e.newValue ? JSON.parse(e.newValue) : [])
        } catch {
          // ignore corrupted data
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const has = useCallback((eventId) => ids.includes(eventId), [ids])

  const toggle = useCallback(
    (eventId) => {
      let added = false
      updateIds((prev) => {
        added = !prev.includes(eventId)
        return added ? [...prev, eventId] : prev.filter((id) => id !== eventId)
      })

      if (tokenManager.hasAccessToken()) {
        if (added) {
          wishlistApi.addToWishlist(eventId).catch(() => {})
        } else {
          wishlistApi.removeFromWishlist(eventId).catch(() => {})
        }
      }
      return added
    },
    [updateIds],
  )

  const clear = useCallback(() => {
    updateIds([])
    if (tokenManager.hasAccessToken()) {
      wishlistApi.clearWishlist().catch(() => {})
    }
  }, [updateIds])

  const value = useMemo(
    () => ({
      ids,
      has,
      toggle,
      clear,
      count: ids.length,
    }),
    [ids, has, toggle, clear],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlistContext() {
  const ctx = useContext(WishlistContext)
  if (!ctx) {
    throw new Error('useWishlistContext must be used within a WishlistProvider')
  }
  return ctx
}
