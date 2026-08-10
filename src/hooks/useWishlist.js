import { useCallback } from 'react'
import { useLocalStorage } from '@hooks/useLocalStorage'

/** Saved events, persisted per browser. */
export function useWishlist() {
  const [ids, setIds] = useLocalStorage('eventspady:wishlist', [])

  const has = useCallback((eventId) => ids.includes(eventId), [ids])

  const toggle = useCallback(
    (eventId) => {
      let added = false
      setIds((prev) => {
        added = !prev.includes(eventId)
        return added ? [...prev, eventId] : prev.filter((id) => id !== eventId)
      })
      return added
    },
    [setIds],
  )

  const clear = useCallback(() => setIds([]), [setIds])

  return { ids, has, toggle, clear, count: ids.length }
}
