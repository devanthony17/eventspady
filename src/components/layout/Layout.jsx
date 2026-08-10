import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import { Navbar } from '@components/layout/Navbar'
import { Footer } from '@components/layout/Footer'
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
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, hash])

  return null
}

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 720)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={cn(
        'fixed bottom-6 right-6 z-40 grid size-11 place-items-center rounded-2xl bg-brand-600 text-white shadow-lift transition-all duration-300 hover:bg-brand-700',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      <ArrowUp className="size-5" />
    </button>
  )
}

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col bg-white dark:bg-ink-950">
      <ScrollToTop />
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}
