import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  BadgeDollarSign,
  CalendarDays,
  Check,
  Compass,
  FileText,
  Globe,
  Heart,
  HelpCircle,
  Home as HomeIcon,
  Info,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu as MenuIcon,
  MessageSquare,
  Newspaper,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  User,
  Users,
  X,
} from 'lucide-react'
import { Ticket } from '@components/icons/AppIcons'
import { Logo } from '@components/layout/Logo'
import { ThemeToggle } from '@components/layout/ThemeToggle'
import { SearchDialog } from '@components/layout/SearchDialog'
import { Button } from '@components/ui/Button'
import { Avatar } from '@components/ui/Avatar'
import { useAuth } from '@context/AuthContext'
import { useCart } from '@context/CartContext'
import { useWishlist } from '@hooks/useWishlist'
import { useClickOutside } from '@hooks/useClickOutside'
import { useIsDesktop } from '@hooks/useMediaQuery'
import { LANGUAGES } from '@lib/constants'
import { cn } from '@lib/utils'

/** Every page reachable from the slide-out menu, each with its own icon. */
const MENU_LINKS = [
  { label: 'Home', to: '/', icon: HomeIcon, end: true },
  { label: 'Events', to: '/events', icon: CalendarDays },
  { label: 'Organizers', to: '/organizers', icon: Users },
  { label: 'Blog', to: '/blog', icon: Newspaper },
  { label: 'About', to: '/about', icon: Info },
  { label: 'How it works', to: '/how-it-works', icon: Compass },
  { label: 'Pricing', to: '/pricing', icon: BadgeDollarSign },
  { label: 'FAQ', to: '/faq', icon: HelpCircle },
  { label: 'Contact', to: '/contact', icon: Mail },
  { label: 'Feedback', to: '/feedback', icon: MessageSquare },
  { label: 'Privacy', to: '/privacy', icon: ShieldCheck },
  { label: 'Terms', to: '/terms', icon: FileText },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [language, setLanguage] = useState(LANGUAGES[0])

  // 'closed' | 'open' | 'closing' — the extra state lets the exit animation finish.
  const [menuState, setMenuState] = useState('closed')

  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, isOrganizer, logout } = useAuth()
  const { summary } = useCart()
  const { count: wishlistCount } = useWishlist()
  const isDesktop = useIsDesktop()

  const userMenuRef = useRef(null)
  const closeTimer = useRef(null)

  useClickOutside(userMenuRef, () => setUserMenuOpen(false), userMenuOpen)

  const closeMenu = useCallback(() => {
    setMenuState((state) => (state === 'open' ? 'closing' : state))
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setMenuState('closed'), 460)
  }, [])

  const openMenu = useCallback(() => {
    clearTimeout(closeTimer.current)
    setMenuState('open')
  }, [])

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close every transient surface on navigation.
  useEffect(() => {
    setUserMenuOpen(false)
    setMenuState((state) => (state === 'open' ? 'closing' : state))
    const timer = setTimeout(() => setMenuState('closed'), 460)
    return () => clearTimeout(timer)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuState === 'open' ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuState])

  // Escape closes the menu; Cmd/Ctrl+K opens search.
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') closeMenu()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeMenu])

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  const menuOpen = menuState === 'open'

  // The home hero is a dark video, so the un-scrolled bar inverts to stay legible.
  const overHero = pathname === '/' && !scrolled

  const iconButton = cn(
    'grid size-10 place-items-center rounded-xl transition',
    overHero
      ? 'text-white/85 hover:bg-white/15 hover:text-white'
      : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/10',
  )

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[95] focus:rounded-xl focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <header
        className={cn(
          'sticky top-0 z-50 border-b transition-all duration-300',
          scrolled
            ? 'border-ink-200/70 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/85'
            : overHero
              ? 'border-transparent bg-transparent'
              : 'border-transparent bg-white/70 backdrop-blur-md dark:bg-ink-950/70',
        )}
      >
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:h-20 lg:px-8">
          {/* Left — brand */}
          <Logo tone={overHero ? 'inverse' : 'auto'} />

          {/* Right — utilities + menu trigger */}
          <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className={iconButton}
              aria-label="Search events"
            >
              <Search className="size-5" />
            </button>

            <ThemeToggle className={cn('hidden sm:grid', overHero && 'text-white/85 hover:bg-white/15 hover:text-white')} />

            <Link
              to="/dashboard/saved"
              className={cn(iconButton, 'relative')}
              aria-label={`Saved events (${wishlistCount})`}
            >
              <Heart className="size-5" />
              {wishlistCount > 0 && (
                <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-4 text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/checkout"
              className={cn(iconButton, 'relative')}
              aria-label={`Booking bag (${summary.count} tickets)`}
            >
              <ShoppingBag className="size-5" />
              {summary.count > 0 && (
                <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-accent-500 px-1 text-[10px] font-bold leading-4 text-white">
                  {summary.count}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-expanded={userMenuOpen}
                  aria-label="Account menu"
                  className={cn(
                    'grid size-10 place-items-center rounded-xl transition',
                    overHero ? 'hover:bg-white/15' : 'hover:bg-ink-100 dark:hover:bg-white/10',
                  )}
                >
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 animate-scale-in overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-card dark:border-white/10 dark:bg-ink-900">
                    <div className="flex items-center gap-3 border-b border-ink-200/70 p-4 dark:border-white/10">
                      <Avatar src={user.avatar} name={user.name} size="md" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{user.name}</p>
                        <p className="truncate text-xs text-ink-500 dark:text-ink-400">{user.email}</p>
                      </div>
                    </div>

                    <div className="p-1.5">
                      {[
                        { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
                        { label: 'My tickets', to: '/dashboard/tickets', icon: Ticket },
                        { label: 'Profile', to: '/dashboard/profile', icon: User },
                        ...(isOrganizer ? [{ label: 'Organizer panel', to: '/organizer', icon: Settings }] : []),
                        ...(user?.role === 'admin' ? [{ label: 'Admin Console', to: '/admin', icon: ShieldCheck }] : []),
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-brand-50 hover:text-brand-700 dark:text-ink-300 dark:hover:bg-white/5 dark:hover:text-white"
                        >
                          <item.icon className="size-4" aria-hidden="true" />
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    <div className="border-t border-ink-200/70 p-1.5 dark:border-white/10">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                      >
                        <LogOut className="size-4" aria-hidden="true" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                to="/login"
                variant="ghost"
                size="sm"
                className={cn('hidden sm:inline-flex', overHero && 'text-white hover:bg-white/15 hover:text-white')}
              >
                Sign in
              </Button>
            )}

            <Button
              to="/organizer"
              size="sm"
              iconLeft={Plus}
              className="hidden xl:inline-flex"
            >
              Create event
            </Button>

            {/* Burger + label */}
            <button
              type="button"
              onClick={menuOpen ? closeMenu : openMenu}
              aria-expanded={menuOpen}
              aria-controls="primary-menu"
              className={cn(
                'ml-1 flex h-10 items-center gap-2 rounded-xl pl-2.5 pr-3 transition',
                overHero
                  ? 'text-white hover:bg-white/15'
                  : 'text-ink-800 hover:bg-ink-100 dark:text-white dark:hover:bg-white/10',
              )}
            >
              <span className="relative grid size-5 place-items-center">
                <MenuIcon
                  className={cn(
                    'absolute size-5 transition-all duration-300',
                    menuOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100',
                  )}
                />
                <X
                  className={cn(
                    'absolute size-5 transition-all duration-300',
                    menuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0',
                  )}
                />
              </span>
              <span className="text-sm font-semibold">Menu</span>
            </button>
          </div>
        </nav>
      </header>

      {menuState !== 'closed' &&
        (isDesktop ? (
          <DesktopMenu
            state={menuState}
            onClose={closeMenu}
            language={language}
            setLanguage={setLanguage}
          />
        ) : (
          <MobileMenu
            state={menuState}
            onClose={closeMenu}
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
          />
        ))}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

/* ------------------------------------------------------- desktop side rail */

/**
 * Narrow full-height rail sliding in from the right.
 * Width is 10% of the viewport, floored so the labels stay readable
 * on smaller laptop screens.
 */
function DesktopMenu({ state, onClose, language, setLanguage }) {
  const [langOpen, setLangOpen] = useState(false)

  return (
    <div id="primary-menu" className="fixed inset-0 z-[80]">
      <div
        className={cn('absolute inset-0 bg-ink-950/45 backdrop-blur-sm', state === 'closing' ? 'animate-fade-in opacity-0 transition-opacity' : 'animate-fade-in')}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'absolute right-0 top-0 flex h-full w-[20%] min-w-[15rem] flex-col border-l border-ink-200/70 bg-white',
          'dark:border-white/10 dark:bg-ink-950',
          state === 'closing' ? 'animate-[slide-in-right_.35s_ease-in_reverse_both]' : 'animate-slide-in-right',
        )}
      >
        <div className="flex items-center justify-between border-b border-ink-200/70 px-3 py-4 dark:border-white/10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-7 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100 dark:hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-0.5">
            {MENU_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition',
                      isActive
                        ? 'bg-brand-600 text-white'
                        : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/[.07] dark:hover:text-white',
                    )
                  }
                >
                  <link.icon className="size-[18px] shrink-0" aria-hidden="true" />
                  <span className="truncate">{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Repositioned Admin Console */}
        <div className="border-t border-ink-200/70 p-2 dark:border-white/10">
          <NavLink
            to="/admin"
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition',
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-ink-500 hover:bg-brand-50 hover:text-brand-700 dark:text-ink-400 dark:hover:bg-white/[.07] dark:hover:text-white',
              )
            }
          >
            <ShieldCheck className="size-4 shrink-0 text-brand-500 dark:text-brand-400" aria-hidden="true" />
            <span className="truncate">Admin Console</span>
          </NavLink>
        </div>

        {/* Language */}
        <div className="border-t border-ink-200/70 p-2 dark:border-white/10">
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            aria-expanded={langOpen}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/[.07]"
          >
            <Globe className="size-[18px] shrink-0" aria-hidden="true" />
            <span className="truncate">{language.label}</span>
          </button>

          {langOpen && (
            <ul className="mt-1 max-h-48 space-y-0.5 overflow-y-auto">
              {LANGUAGES.map((item) => (
                <li key={item.code}>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage(item)
                      setLangOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition',
                      item.code === language.code
                        ? 'bg-brand-50 font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                        : 'text-ink-600 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-white/5',
                    )}
                  >
                    <span aria-hidden="true">{item.flag}</span>
                    <span className="truncate">{item.label}</span>
                    {item.code === language.code && <Check className="ml-auto size-3 shrink-0" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}

/* --------------------------------------------- mobile circular reveal menu */

/** Full-viewport menu that wipes open in a circle from the burger button. */
function MobileMenu({ state, onClose, isAuthenticated, onLogout }) {
  return (
    <div
      id="primary-menu"
      className={cn(
        'fixed inset-0 z-[80] overflow-y-auto bg-gradient-to-br from-brand-800 via-brand-900 to-ink-950 text-white',
        state === 'closing' ? 'animate-circle-out' : 'animate-circle-in',
      )}
    >
      <div className="flex min-h-full flex-col px-6 pb-10 pt-5">
        <div className="mb-8 flex items-center justify-between">
          <Logo tone="inverse" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 items-center gap-2 rounded-xl pl-2.5 pr-3 text-white transition hover:bg-white/10"
          >
            <X className="size-5" />
            <span className="text-sm font-semibold">Close</span>
          </button>
        </div>

        <nav className="flex-1">
          <ul className="space-y-1">
            {MENU_LINKS.map((link, i) => (
              <li key={link.to} style={{ animationDelay: `${120 + i * 35}ms` }} className="animate-fade-up">
                <NavLink
                  to={link.to}
                  end={link.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-4 rounded-2xl px-3 py-3 text-lg font-bold transition',
                      isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white',
                    )
                  }
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10">
                    <link.icon className="size-5" aria-hidden="true" />
                  </span>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Repositioned Admin Console */}
        <div className="mt-6 border-t border-white/15 pt-4">
          <NavLink
            to="/admin"
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition',
                isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-white/75 hover:bg-white/10 hover:text-white',
              )
            }
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/10">
              <ShieldCheck className="size-4 text-brand-300" aria-hidden="true" />
            </span>
            <span>Admin Console</span>
          </NavLink>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          {isAuthenticated ? (
            <Button variant="outline" fullWidth size="lg" iconLeft={LogOut} onClick={onLogout} className="border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white">
              Sign out
            </Button>
          ) : (
            <>
              <Button to="/login" variant="outline" fullWidth size="lg" onClick={onClose} className="border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white">
                Sign in
              </Button>
              <Button to="/register" variant="accent" fullWidth size="lg" onClick={onClose}>
                Create account
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
