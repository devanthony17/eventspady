import { useEffect } from 'react'

/** Calls `handler` on outside pointer-down or Escape — used by menus and dialogs. */
export function useClickOutside(ref, handler, active = true) {
  useEffect(() => {
    if (!active) return

    const onPointerDown = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return
      handler(event)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') handler(event)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [ref, handler, active])
}
