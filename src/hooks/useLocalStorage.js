import { useCallback, useEffect, useState } from 'react'

/** State that survives reloads. Falls back to `initialValue` if storage is unavailable. */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* quota exceeded or storage disabled — keep the in-memory value */
    }
  }, [key, value])

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
    setValue(initialValue)
  }, [key, initialValue])

  return [value, setValue, remove]
}
