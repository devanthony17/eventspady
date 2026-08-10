import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react'
import { cn } from '@lib/utils'

const ToastContext = createContext(null)

const VARIANTS = {
  success: { icon: CheckCircle2, ring: 'ring-emerald-500/30', tone: 'text-emerald-600 dark:text-emerald-400' },
  error: { icon: XCircle, ring: 'ring-rose-500/30', tone: 'text-rose-600 dark:text-rose-400' },
  warning: { icon: TriangleAlert, ring: 'ring-amber-500/30', tone: 'text-amber-600 dark:text-amber-400' },
  info: { icon: Info, ring: 'ring-brand-500/30', tone: 'text-brand-600 dark:text-brand-400' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const toast = useCallback(
    (message, { variant = 'info', title, duration = 4200 } = {}) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((list) => [...list, { id, message, variant, title }])
      timers.current.set(id, setTimeout(() => dismiss(id), duration))
      return id
    },
    [dismiss],
  )

  const value = useMemo(
    () => ({
      toast,
      dismiss,
      success: (m, o) => toast(m, { ...o, variant: 'success' }),
      error: (m, o) => toast(m, { ...o, variant: 'error' }),
      warning: (m, o) => toast(m, { ...o, variant: 'warning' }),
      info: (m, o) => toast(m, { ...o, variant: 'info' }),
    }),
    [toast, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:top-0 sm:items-end sm:p-6"
        role="region"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => {
          const variant = VARIANTS[t.variant] ?? VARIANTS.info
          const Icon = variant.icon
          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm animate-scale-in items-start gap-3 rounded-2xl bg-white p-4 shadow-card ring-1',
                'dark:bg-ink-900',
                variant.ring,
              )}
            >
              <Icon className={cn('mt-0.5 size-5 shrink-0', variant.tone)} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                {t.title && <p className="text-sm font-semibold">{t.title}</p>}
                <p className="text-sm text-ink-600 dark:text-ink-300">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="-m-1 rounded-lg p-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
