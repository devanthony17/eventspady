import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  ChevronDown,
  ExternalLink,
  Globe,
  LogOut,
  Menu,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Ticket,
  User,
} from 'lucide-react'
import { Logo } from '@components/layout/Logo'
import { ThemeToggle } from '@components/layout/ThemeToggle'
import { Avatar } from '@components/ui/Avatar'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { useAuth } from '@context/AuthContext'
import { useClickOutside } from '@hooks/useClickOutside'
import { cn } from '@lib/utils'

export function PortalTopNav({ portal: propPortal, onToggleMobileNav }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  useClickOutside(userMenuRef, () => setUserMenuOpen(false), userMenuOpen)

  // Auto-detect portal type if not passed
  const activePortal =
    propPortal ||
    (pathname.startsWith('/admin')
      ? 'admin'
      : pathname.startsWith('/organizer')
        ? 'organizer'
        : 'attendee')

  // Close menus on path change
  useEffect(() => {
    setUserMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate('/login')
  }

  // Configuration per portal type
  const portalMeta = {
    attendee: {
      name: 'Attendee Portal',
      icon: Ticket,
      badgeClass: 'bg-brand-600 text-white shadow-sm',
      rootTo: '/dashboard',
    },
    organizer: {
      name: 'Organizer Hub',
      icon: Sparkles,
      badgeClass: 'bg-accent-500 text-white shadow-sm',
      rootTo: '/organizer',
    },
    admin: {
      name: 'Admin Console',
      icon: ShieldCheck,
      badgeClass: 'bg-brand-700 text-white shadow-sm',
      rootTo: '/admin',
    },
  }

  const current = portalMeta[activePortal] || portalMeta.attendee

  return (
    <header className="sticky top-0 z-40 w-full border-b border-ink-200/80 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-ink-950/95">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Menu Button + Brand + Single Portal/Website Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile Side Nav Toggle Button */}
          <button
            type="button"
            onClick={onToggleMobileNav}
            aria-label="Open portal navigation"
            className="grid size-9 place-items-center rounded-xl border border-ink-200 bg-white text-ink-600 transition hover:bg-ink-100 active:scale-95 dark:border-white/10 dark:bg-ink-900 dark:text-ink-300 lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <Logo to={current.rootTo} size="sm" />

          <div className="h-5 w-px bg-ink-200/80 dark:bg-white/15" aria-hidden="true" />

          {/* Segmented Toggle: Current Portal <-> Website (strictly no other portals) */}
          <div className="inline-flex items-center rounded-xl border border-ink-200/80 bg-ink-100/60 p-0.5 dark:border-white/10 dark:bg-white/[.04]">
            {/* Active Portal Tab */}
            <Link
              to={current.rootTo}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition',
                current.badgeClass,
              )}
              title={`${current.name} (Active)`}
            >
              <current.icon className="size-3.5" />
              <span className="hidden sm:inline">{current.name}</span>
              <span className="sm:hidden">{current.name.split(' ')[0]}</span>
            </Link>

            {/* Toggle to Website */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-ink-600 hover:text-ink-900 hover:bg-white dark:text-ink-300 dark:hover:text-white dark:hover:bg-white/10 transition"
              title="Toggle to Main Website"
            >
              <Globe className="size-3.5" />
              <span>Website</span>
            </Link>
          </div>
        </div>

        {/* Right: Actions, Telemetry, Theme, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin status pill */}
          {activePortal === 'admin' && (
            <div className="hidden md:flex items-center gap-1.5 rounded-md border border-ink-200/60 bg-white/60 px-2.5 py-1 text-xs font-medium text-ink-600 dark:border-white/10 dark:bg-white/[.04] dark:text-ink-300">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>Systems operational</span>
            </div>
          )}

          {/* Organizer Quick CTA */}
          {activePortal === 'organizer' && (
            <Button
              to="/organizer/events/new"
              size="sm"
              variant="accent"
              iconLeft={Plus}
              className="hidden sm:inline-flex text-xs"
            >
              Create event
            </Button>
          )}

          {/* Attendee Quick CTA */}
          {activePortal === 'attendee' && (
            <Button
              to="/events"
              size="sm"
              variant="outline"
              iconLeft={CalendarDays}
              className="hidden sm:inline-flex text-xs border-ink-200/80 dark:border-white/10"
            >
              Explore events
            </Button>
          )}

          {/* Website Toggle Shortcut */}
          <Link
            to="/"
            className="hidden md:inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-ink-600 transition hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/10 dark:hover:text-white"
            title="Toggle to Public Website"
          >
            <ExternalLink className="size-3.5" />
            <span>Public Site</span>
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle className="size-9" />

          {/* User Profile Avatar & Dropdown */}
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              aria-expanded={userMenuOpen}
              aria-label="User account menu"
              className="flex items-center gap-2 rounded-xl p-1 transition hover:bg-ink-100 dark:hover:bg-white/10"
            >
              <Avatar
                src={user?.avatar || '/images/avatars/avatar-1.svg'}
                name={user?.name || 'User'}
                size="sm"
              />
              <span className="hidden xl:inline text-xs font-bold text-ink-800 dark:text-ink-200 max-w-[100px] truncate">
                {user?.name?.split(' ')[0] || 'Account'}
              </span>
              <ChevronDown className="size-3 text-ink-400 hidden xl:inline" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 animate-scale-in overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-xl dark:border-white/10 dark:bg-ink-900 z-50">
                <div className="flex items-center gap-3 border-b border-ink-200/70 p-4 dark:border-white/10">
                  <Avatar
                    src={user?.avatar || '/images/avatars/avatar-1.svg'}
                    name={user?.name || 'User'}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink-900 dark:text-white">
                      {user?.name || 'Account User'}
                    </p>
                    <p className="truncate text-xs text-ink-500 dark:text-ink-400">
                      {user?.email || 'user@eventspady.com'}
                    </p>
                    <Badge
                      tone={user?.role === 'admin' ? 'brand' : user?.role === 'organizer' ? 'accent' : 'brand'}
                      size="sm"
                      className="mt-1"
                    >
                      {user?.role === 'admin'
                        ? 'Platform Admin'
                        : user?.role === 'organizer'
                          ? 'Verified Organizer'
                          : 'Attendee'}
                    </Badge>
                  </div>
                </div>

                <div className="p-1.5 space-y-0.5">
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/5 dark:hover:text-white"
                  >
                    <User className="size-4" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/dashboard/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/5 dark:hover:text-white"
                  >
                    <Settings className="size-4" />
                    <span>Account Settings</span>
                  </Link>

                  {/* Toggle directly to website (strictly no other portals) */}
                  <Link
                    to="/"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/5 dark:hover:text-white"
                  >
                    <Globe className="size-4" />
                    <span>Go to Website</span>
                  </Link>
                </div>

                <div className="border-t border-ink-200/70 p-1.5 dark:border-white/10">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                  >
                    <LogOut className="size-4" />
                    <span>Sign out (routes to sign in)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
