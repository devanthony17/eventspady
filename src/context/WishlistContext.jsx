import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { wishlistApi } from '@api/wishlist.api'
import tokenManager from '@api/tokenManager'
import { useEvents } from '@hooks/api'

const STORAGE_KEY = 'eventspady:wishlist'
const WishlistContext = createContext(null)

// Known legacy mock IDs to automatically purge from localStorage
const LEGACY_MOCK_IDS = new Set([
  'wa-city-marathon',
  'dumba-festival',
  'sombo-sound-clash',
  'shea-agro-expo',
  'kulpawn-cinema',
  'savannah-devcon',
  'savannah-esports',
  'nandom-pottery',
  'inter-communities-soccer',
  'blackfriday-night',
  'miss-dumba',
  'wechiau-safari',
  'event-1',
  'event-2',
  'event-3',
])

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      // Purge any old mockup IDs
      const cleaned = parsed.filter((id) => id && !LEGACY_MOCK_IDS.has(String(id)))
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
      }
      return cleaned
    } catch {
      return []
    }
  })

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

  // Cross-reference with live events to prevent phantom counter badges
  const { data: eventsData, isSuccess: eventsLoaded } = useEvents()

  const validEventIds = useMemo(() => {
    if (!eventsLoaded) return null
    const list = Array.isArray(eventsData) ? eventsData : eventsData?.events || eventsData?.data
    if (!Array.isArray(list)) return null
    return new Set(list.map((e) => String(e.id)))
  }, [eventsData, eventsLoaded])

  // Filter ids to only existing live events if event catalog has loaded
  const activeIds = useMemo(() => {
    if (!validEventIds) return ids
    // If backend returned event list (even if empty []), only keep IDs that actually exist
    return ids.filter((id) => validEventIds.has(String(id)))
  }, [ids, validEventIds])

  // Auto-prune stale IDs from storage once events data confirms they do not exist
  useEffect(() => {
    if (validEventIds && ids.some((id) => !validEventIds.has(String(id)))) {
      updateIds(activeIds)
    }
  }, [validEventIds, ids, activeIds, updateIds])

  // Synchronize with backend wishlist on mount if authenticated
  useEffect(() => {
    if (tokenManager.hasAccessToken()) {
      wishlistApi
        .getWishlist()
        .then((res) => {
          const serverIds = Array.isArray(res) ? res : res?.wishlist || res?.data || []
          const normalized = serverIds
            .map((item) => (typeof item === 'string' ? item : item.id || item.eventId))
            .filter(Boolean)
          setIds(normalized)
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
          } catch {}
        })
        .catch(() => {
          // Fallback silently to local storage
        })
    }
  }, [])

  // Listen to external window/tab storage changes
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          const parsed = e.newValue ? JSON.parse(e.newValue) : []
          const cleaned = Array.isArray(parsed)
            ? parsed.filter((id) => id && !LEGACY_MOCK_IDS.has(String(id)))
            : []
          setIds(cleaned)
        } catch {
          // ignore corrupted data
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const has = useCallback((eventId) => activeIds.includes(eventId), [activeIds])

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
      ids: activeIds,
      has,
      toggle,
      clear,
      count: activeIds.length,
    }),
    [activeIds, has, toggle, clear],
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
