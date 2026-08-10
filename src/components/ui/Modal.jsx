import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@lib/utils'

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

/** Accessible dialog: locks scroll, traps focus and closes on Escape or backdrop click. */
export function Modal({ open, onClose, title, description, size = 'md', children, footer, className }) {
  const panelRef = useRef(null)
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    // Move focus into the dialog once it is painted.
    const raf = requestAnimationFrame(() => panelRef.current?.focus())

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      cancelAnimationFrame(raf)
      document.body.style.overflow = overflow
      previouslyFocused.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 animate-fade-in bg-ink-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        className={cn(
          'relative z-10 max-h-[92vh] w-full animate-scale-in overflow-y-auto rounded-t-3xl bg-white shadow-card outline-none',
          'dark:bg-ink-900 sm:rounded-3xl',
          SIZES[size],
          className,
        )}
      >
        {(title || onClose) && (
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-ink-200/70 bg-white/95 px-6 py-5 backdrop-blur dark:border-white/10 dark:bg-ink-900/95">
            <div className="min-w-0">
              {title && <h2 className="text-lg font-bold">{title}</h2>}
              {description && <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-m-1.5 rounded-xl p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-800 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Close dialog"
            >
              <X className="size-5" />
            </button>
          </div>
        )}

        <div className="px-6 py-5">{children}</div>

        {footer && (
          <div className="sticky bottom-0 border-t border-ink-200/70 bg-white/95 px-6 py-4 backdrop-blur dark:border-white/10 dark:bg-ink-900/95">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
