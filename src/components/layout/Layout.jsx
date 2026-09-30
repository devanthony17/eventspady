import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import { Navbar } from '@components/layout/Navbar'
import { Footer } from '@components/layout/Footer'
import { LocationModal } from '@components/layout/LocationModal'
import { ErrorBoundary } from '@components/ui/ErrorBoundary'
import { cn } from '@lib/utils'

/** Restores scroll to the top on navigation, but respects in-page hash links. */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    const html = document.documentElement
    const prevBehavior = html.style.scrollBehavior
    html.style.scrollBehavior = 'auto'
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    html.style.scrollBehavior = prevBehavior
  }, [pathname, hash])

  return null
}

const RING_RADIUS = 21
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

/**
 * Back-to-top control with no filled background — the ring itself is the
 * surface, and its arc grows from empty to a full circle as the page scrolls.
 */
function BackToTop() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const frame = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight
        setProgress(scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0)
        setVisible(window.scrollY > 320)
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame.current)
    }
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={`Back to top — ${Math.round(progress * 100)}% of the page read`}
      className={cn(
        'group fixed bottom-6 right-6 z-40 grid size-12 place-items-center rounded-full',
        'text-ink-700 backdrop-blur-md transition-all duration-300 dark:text-white',
        'hover:text-brand-600 dark:hover:text-brand-300',
        visible ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-3 scale-90 opacity-0',
      )}
    >
      {/* Progress ring — rotated so the arc starts at 12 o'clock */}
      <svg viewBox="0 0 48 48" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
        <circle
          cx="24"
          cy="24"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="2.5"
          className="stroke-ink-900/15 dark:stroke-white/20"
        />
        <circle
          cx="24"
          cy="24"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
          className="stroke-brand-600 transition-[stroke-dashoffset] duration-150 ease-out dark:stroke-brand-300"
        />
      </svg>

      <ArrowUp className="relative size-[18px] transition-transform duration-300 group-hover:-translate-y-0.5" />
    </button>
  )
}

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col bg-white dark:bg-ink-950">
      <ScrollToTop />
      <Navbar />
      <main id="main" className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <BackToTop />
      <LocationModal />
    </div>
  )
}
