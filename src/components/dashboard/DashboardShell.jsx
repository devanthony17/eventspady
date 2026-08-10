import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Container } from '@components/ui/Section'
import { Avatar } from '@components/ui/Avatar'
import { Badge } from '@components/ui/Badge'
import { useAuth } from '@context/AuthContext'
import { cn } from '@lib/utils'

/**
 * Two-column shell shared by the attendee dashboard and the organizer panel.
 * `nav`: [{ label, to, icon, end?, badge? }]
 */
export function DashboardShell({ nav, title, description, actions, children, eyebrow }) {
  const { user } = useAuth()
  const [navOpen, setNavOpen] = useState(false)
  const { pathname } = useLocation()

  const linkClass = ({ isActive }) =>
    cn(
      'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition',
      isActive
        ? 'bg-brand-600 text-white shadow-lift'
        : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/[.06] dark:hover:text-white',
    )

  const navList = (
    <nav className="space-y-1">
      {nav.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={() => setNavOpen(false)}>
          <item.icon className="size-4 shrink-0" aria-hidden="true" />
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge != null && item.badge > 0 && (
            <span className="rounded-full bg-accent-500 px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white">
              {item.badge}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="bg-ink-50 py-8 dark:bg-white/[.02] sm:py-10">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              {user && (
                <div className="surface flex items-center gap-3 p-4">
                  <Avatar src={user.avatar} name={user.name} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{user.name}</p>
                    <p className="truncate text-xs text-ink-500 dark:text-ink-400">{user.email}</p>
                    <Badge tone={user.role === 'organizer' ? 'accent' : 'brand'} size="sm" className="mt-1.5">
                      {user.role === 'organizer' ? 'Organizer' : 'Attendee'}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="surface p-3">{navList}</div>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                {eyebrow && (
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    {eyebrow}
                  </p>
                )}
                <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
                {description && (
                  <p className="mt-1.5 text-pretty text-sm text-ink-500 dark:text-ink-400">{description}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {actions}
                <button
                  type="button"
                  onClick={() => setNavOpen(true)}
                  className="grid size-10 place-items-center rounded-xl border border-ink-200 bg-white text-ink-700 transition hover:bg-ink-100 dark:border-white/10 dark:bg-ink-900 dark:text-ink-200 lg:hidden"
                  aria-label="Open dashboard menu"
                >
                  <Menu className="size-5" />
                </button>
              </div>
            </div>

            {children}
          </div>
        </div>
      </Container>

      {/* Mobile nav drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-[85] lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-ink-950/50 backdrop-blur-sm"
            onClick={() => setNavOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-[min(18rem,85vw)] animate-scale-in overflow-y-auto bg-white p-4 dark:bg-ink-950">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-bold uppercase tracking-wider text-ink-400">Menu</p>
              <button
                type="button"
                onClick={() => setNavOpen(false)}
                className="grid size-9 place-items-center rounded-xl text-ink-500 transition hover:bg-ink-100 dark:hover:bg-white/10"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>
            {navList}
          </div>
        </div>
      )}

      {/* Announce route changes for assistive tech */}
      <span className="sr-only" aria-live="polite">
        {pathname}
      </span>
    </div>
  )
}
