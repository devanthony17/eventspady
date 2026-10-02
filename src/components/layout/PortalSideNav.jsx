import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  BadgePercent,
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  CalendarDays,
  ExternalLink,
  Globe,
  Heart,
  LayoutDashboard,
  LogOut,
  Palette,
  Plus,
  Receipt,
  ScanLine,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react'
import { Ticket } from '@components/icons/AppIcons'
import { Logo } from '@components/layout/Logo'
import { Avatar } from '@components/ui/Avatar'
import { Badge } from '@components/ui/Badge'
import { useAuth } from '@context/AuthContext'
import { useWishlist } from '@hooks/useWishlist'
import { useStore } from '@context/StoreContext'
import { useUserNotifications, useAdminOrganizers } from '@hooks/api'
import { cn } from '@lib/utils'

export function PortalSideNav({ portal: propPortal, mobileOpen = false, onClose }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, isOrganizer, logout } = useAuth()
  const { count: wishlistCount } = useWishlist()
  const { organizers: storeOrganizers = [] } = useStore()
  const { data: notificationsData } = useUserNotifications()
  const { data: organizersData } = useAdminOrganizers()

  const notifications = useMemo(() => {
    if (Array.isArray(notificationsData)) return notificationsData
    return notificationsData?.notifications || notificationsData?.data || []
  }, [notificationsData])

  const organizers = useMemo(() => {
    if (Array.isArray(organizersData)) return organizersData
    if (Array.isArray(organizersData?.organizers)) return organizersData.organizers
    if (Array.isArray(organizersData?.data)) return organizersData.data
    if (organizersData !== undefined) return []
    return storeOrganizers
  }, [organizersData, storeOrganizers])

  // Transition state: 'closed' | 'open' | 'closing'
  const [animState, setAnimState] = useState(mobileOpen ? 'open' : 'closed')
  const [prevMobileOpen, setPrevMobileOpen] = useState(mobileOpen)
  const closeTimer = useRef(null)

  // Auto-detect portal type if not passed
  const activePortal =
    propPortal ||
    (pathname.startsWith('/admin')
      ? 'admin'
      : pathname.startsWith('/organizer')
        ? 'organizer'
        : 'attendee')

  const unreadNotifications = notifications.filter((n) => !n.read).length
  const pendingOrganizersCount = organizers.filter((o) => o.status === 'pending').length

  // Synchronous render-phase state adjustment: ensures the menu opens on the exact first frame
  if (mobileOpen !== prevMobileOpen) {
    setPrevMobileOpen(mobileOpen)
    if (mobileOpen) {
      clearTimeout(closeTimer.current)
      setAnimState('open')
    } else if (animState === 'open') {
      setAnimState('closed')
    }
  }

  // Smooth animated close when explicitly tapping "Close" (X) or pressing Escape
  const handleAnimatedClose = useCallback(() => {
    clearTimeout(closeTimer.current)
    setAnimState('closing')
    closeTimer.current = setTimeout(() => {
      setAnimState('closed')
      if (onClose) onClose()
    }, 220)
  }, [onClose])

  // Instant dismissal on link navigation: reveals target page with 0ms delay!
  const handleNavClick = useCallback(() => {
    clearTimeout(closeTimer.current)
    setAnimState('closed')
    if (onClose) onClose()
  }, [onClose])

  // Dismiss menu immediately if route changes from any source
  useEffect(() => {
    if (animState !== 'closed' && onClose) {
      clearTimeout(closeTimer.current)
      setAnimState('closed')
      onClose()
    }
  }, [pathname])

  // Prevent background scroll when mobile menu is active
  useEffect(() => {
    if (animState === 'open' || animState === 'closing') {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      clearTimeout(closeTimer.current)
    }
  }, [animState])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && (mobileOpen || animState === 'open')) {
        handleAnimatedClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen, animState, handleAnimatedClose])

  const handleLogout = () => {
    logout()
    handleNavClick()
    navigate('/login')
  }

  // Navigation configuration per portal type
  const portalNavConfigs = {
    attendee: {
      name: 'Attendee Portal',
      icon: Ticket,
      badgeTone: 'brand',
      rootTo: '/dashboard',
      accentColor: 'text-brand-400',
      groups: [
        {
          title: 'Main Menu',
          items: [
            { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
            { label: 'My tickets', to: '/dashboard/tickets', icon: Ticket },
            { label: 'Saved events', to: '/dashboard/saved', icon: Heart, badge: wishlistCount, badgeTone: 'rose' },
            { label: 'Notifications', to: '/dashboard/notifications', icon: Bell, badge: unreadNotifications, badgeTone: 'accent' },
          ],
        },
        {
          title: 'Account & Preferences',
          items: [
            { label: 'Profile', to: '/dashboard/profile', icon: User },
            { label: 'Settings', to: '/dashboard/settings', icon: Settings },
          ],
        },
      ],
    },
    organizer: {
      name: 'Organizer Hub',
      icon: Briefcase,
      badgeTone: 'accent',
      rootTo: '/organizer',
      accentColor: 'text-accent-400',
      groups: [
        {
          title: 'Event Management',
          items: [
            { label: 'Overview', to: '/organizer', icon: LayoutDashboard, end: true },
            { label: 'My events', to: '/organizer/events', icon: CalendarDays },
            { label: 'Create event', to: '/organizer/events/new', icon: Plus, highlight: true },
          ],
        },
        {
          title: 'Sales & Operations',
          items: [
            { label: 'Orders & MoMo', to: '/organizer/orders', icon: Receipt },
            { label: 'Coupons & Discounts', to: '/organizer/coupons', icon: BadgePercent },
            { label: 'Guest list & Check-in', to: '/organizer/guests', icon: Users },
            { label: 'Door QR Scanner', to: '/organizer/scanner', icon: ScanLine },
          ],
        },
      ],
    },
    admin: {
      name: 'Admin Console',
      icon: ShieldCheck,
      badgeTone: 'purple',
      rootTo: '/admin',
      accentColor: 'text-purple-400',
      groups: [
        {
          title: 'Platform Overview',
          items: [
            { label: 'Overview & Metrics', to: '/admin', icon: BarChart3, end: true },
            {
              label: 'Organizers & Verification',
              to: '/admin/organizers',
              icon: Shield,
              badge: pendingOrganizersCount > 0 ? pendingOrganizersCount : null,
              badgeTone: 'amber',
            },
          ],
        },
        {
          title: 'Platform Operations',
          items: [
            { label: 'Events Platform', to: '/admin/events', icon: Calendar },
            { label: 'Attendees & Accounts', to: '/admin/users', icon: Users },
            { label: 'Orders & MoMo Ledger', to: '/admin/orders', icon: Receipt },
          ],
        },
        {
          title: 'Content Management',
          items: [
            { label: 'Landing Page CMS', to: '/admin/cms', icon: Palette },
          ],
        },
      ],
    },
  }

  const current = portalNavConfigs[activePortal] || portalNavConfigs.attendee

  // Desktop side nav content
  const desktopNavContent = (
    <div className="flex h-full flex-col justify-between">
      <div className="space-y-6">
        {current.groups.map((group, gIdx) => (
          <div key={group.title || gIdx} className="space-y-1">
            {group.title && (
              <p className="px-3.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-ink-400 dark:text-ink-500">
                {group.title}
              </p>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-brand-600 text-white shadow-lift shadow-brand-600/20'
                      : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/[.07] dark:hover:text-white',
                  )
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <item.icon className="size-4 shrink-0 transition-transform duration-150 group-hover:scale-110" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge != null && item.badge > 0 && (
                  <span
                    className={cn(
                      'ml-2 flex items-center justify-center rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-none',
                      item.badgeTone === 'amber'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40'
                        : item.badgeTone === 'rose'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/40'
                          : 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200',
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom Sidebar Info & Actions */}
      <div className="space-y-3 pt-6 border-t border-ink-200/70 dark:border-white/10 mt-6">
        {activePortal === 'admin' && (
          <div className="rounded-lg border border-ink-200/70 bg-ink-50/70 p-2.5 text-xs text-ink-600 dark:border-white/10 dark:bg-white/[.02] dark:text-ink-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium text-ink-800 dark:text-ink-200">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Production Core
              </span>
              <span className="text-[10px] text-ink-400">v1.0.1</span>
            </div>
          </div>
        )}

        {activePortal === 'organizer' && (
          <Link
            to="/organizer/events/new"
            className="flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-accent-600 shadow-accent-500/20"
          >
            <Plus className="size-4" />
            <span>Create New Event</span>
          </Link>
        )}

        {/* Toggle to Public Website */}
        <Link
          to="/"
          className="flex items-center justify-between rounded-xl border border-ink-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-ink-700 shadow-sm transition hover:border-brand-500 hover:text-brand-600 dark:border-white/10 dark:bg-ink-900 dark:text-ink-300 dark:hover:text-white"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="size-3.5" />
            Public Website
          </span>
          <Globe className="size-3 text-ink-400" />
        </Link>

        {user && (
          <div className="flex items-center justify-between rounded-xl bg-ink-100/70 p-2.5 dark:bg-white/[.04]">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                src={user?.avatar || '/images/avatars/avatar-1.svg'}
                name={user?.name || 'User'}
                size="sm"
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-ink-900 dark:text-white">
                  {user?.name || 'User'}
                </p>
                <p className="truncate text-[10px] text-ink-500 dark:text-ink-400">
                  {user?.email || 'user@eventspady.com'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out (routes to sign in)"
              className="grid size-7 place-items-center rounded-lg text-ink-400 transition hover:bg-white hover:text-rose-600 dark:hover:bg-ink-800"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sticky Side Nav */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-ink-200/80 bg-white p-4 dark:border-white/10 dark:bg-ink-950 lg:block">
        {desktopNavContent}
      </aside>

      {/* Full-Screen Mobile Menu Wiping Open from Top-Left and Reverse on Close */}
      {animState !== 'closed' && (
        <div
          id="portal-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={`${current.name} navigation`}
          className={cn(
            'fixed inset-0 z-[80] overflow-y-auto bg-gradient-to-br from-brand-950 via-ink-950 to-brand-900 text-white lg:hidden transform-gpu will-change-[clip-path]',
            animState === 'closing' ? 'animate-circle-out-tl' : 'animate-circle-in-tl',
          )}
        >
          <div className="flex min-h-full flex-col px-5 pb-10 pt-4">
            {/* Top Bar: Brand, Portal Title, Close Button */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <Logo tone="inverse" size="sm" to={current.rootTo} onClick={handleNavClick} />
                <span className="h-4 w-px bg-white/20" aria-hidden="true" />
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-extrabold tracking-wide text-white border border-white/15">
                  <current.icon className="size-3.5" />
                  <span>{current.name}</span>
                </span>
              </div>

              {/* Close Button reversing into top-left */}
              <button
                type="button"
                onClick={handleAnimatedClose}
                aria-label="Close menu"
                className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20 active:scale-95"
              >
                <X className="size-4" />
                <span>Close</span>
              </button>
            </div>

            {/* User Profile & Portal Toggle Card */}
            {user && (
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-xl mb-6">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user?.avatar || '/images/avatars/avatar-1.svg'}
                    name={user?.name || 'User'}
                    size="md"
                    className="ring-2 ring-white/25"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-white">
                      {user?.name || 'Account User'}
                    </p>
                    <p className="truncate text-xs text-white/70">
                      {user?.email || 'user@eventspady.com'}
                    </p>
                    <Badge tone="accent" size="sm" className="mt-1">
                      {user?.role === 'admin'
                        ? 'Platform Admin'
                        : user?.role === 'organizer'
                          ? 'Verified Organizer'
                          : 'Attendee'}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center justify-between">
                  <span className="text-xs text-white/70 font-semibold">Active Mode:</span>
                  <div className="inline-flex items-center rounded-xl bg-black/25 p-0.5 border border-white/15">
                    <span className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-bold text-white">
                      {current.name.split(' ')[0]}
                    </span>
                    <Link
                      to="/"
                      onClick={handleNavClick}
                      className="rounded-lg px-2.5 py-1 text-xs font-semibold text-white/75 hover:text-white transition active:scale-95"
                    >
                      Website
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Categorized Navigation Links with Touch-friendly Targets */}
            <nav className="flex-1 space-y-6">
              {current.groups.map((group, gIdx) => (
                <div key={group.title || gIdx} className="space-y-1.5">
                  {group.title && (
                    <p className="px-1 text-xs font-extrabold uppercase tracking-wider text-white/50 mb-2">
                      {group.title}
                    </p>
                  )}
                  {group.items.map((item) => (
                    <div key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          cn(
                            'flex min-h-[50px] items-center justify-between rounded-2xl px-4 py-3 text-base font-bold transition active:scale-[0.98]',
                            isActive
                              ? 'bg-white/25 text-white shadow-lift ring-1 ring-white/30'
                              : 'bg-white/5 text-white/80 hover:bg-white/15 hover:text-white active:bg-white/20',
                          )
                        }
                      >
                        <div className="flex items-center gap-3.5">
                          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15">
                            <item.icon className="size-5" />
                          </span>
                          <span>{item.label}</span>
                        </div>

                        {item.badge != null && item.badge > 0 && (
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-1 text-xs font-black leading-none text-white shadow-sm',
                              item.badgeTone === 'amber'
                                ? 'bg-amber-500 animate-pulse'
                                : item.badgeTone === 'rose'
                                  ? 'bg-rose-500'
                                  : 'bg-accent-500',
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    </div>
                  ))}
                </div>
              ))}
            </nav>

            {/* Bottom Actions & Sign Out */}
            <div className="mt-8 space-y-3 pt-6 border-t border-white/15">
              {activePortal === 'organizer' && (
                <Link
                  to="/organizer/events/new"
                  onClick={handleNavClick}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:bg-accent-600 active:scale-95"
                >
                  <Plus className="size-5" />
                  <span>Create New Event</span>
                </Link>
              )}

              {activePortal === 'attendee' && (
                <Link
                  to="/events"
                  onClick={handleNavClick}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:bg-brand-500 active:scale-95"
                >
                  <CalendarDays className="size-5" />
                  <span>Explore Events</span>
                </Link>
              )}

              {/* Direct link to public website */}
              <Link
                to="/"
                onClick={handleNavClick}
                className="flex w-full items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20 active:scale-95"
              >
                <span className="flex items-center gap-2.5">
                  <Globe className="size-4" />
                  Go to Main Website
                </span>
                <ExternalLink className="size-4 text-white/70" />
              </Link>

              {/* Sign out routing to /login */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/20 py-3 text-sm font-bold text-rose-300 transition hover:bg-rose-500/30 active:scale-95"
              >
                <LogOut className="size-4" />
                <span>Sign Out to Login Page</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
