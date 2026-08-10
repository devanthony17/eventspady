import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  Globe,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Ticket,
  User,
  Wallet,
  X,
} from 'lucide-react'
import { Logo } from '@components/layout/Logo'
import { ThemeToggle } from '@components/layout/ThemeToggle'
import { SearchDialog } from '@components/layout/SearchDialog'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Avatar } from '@components/ui/Avatar'
import { useAuth } from '@context/AuthContext'
import { useCart } from '@context/CartContext'
import { useWishlist } from '@hooks/useWishlist'
import { useClickOutside } from '@hooks/useClickOutside'
import { categories } from '@data/categories'
import { LANGUAGES } from '@lib/constants'
import { cn } from '@lib/utils'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Events', to: '/events', mega: true },
  { label: 'Organizers', to: '/organizers' },
  { label: 'Blog', to: '/blog' },
  {
    label: 'Pages',
    to: '/about',
    dropdown: [
      { label: 'About us', to: '/about' },
      { label: 'How it works', to: '/how-it-works' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Contact', to: '/contact' },
      { label: 'Feedback', to: '/feedback' },
      { label: 'Privacy policy', to: '/privacy' },
      { label: 'Terms of service', to: '/terms' },
    ],
  },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [language, setLanguage] = useState(LANGUAGES[0])

  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, isOrganizer, logout } = useAuth()
  const { summary } = useCart()
  const { count: wishlistCount } = useWishlist()

  const navRef = useRef(null)
  const userMenuRef = useRef(null)
  const langRef = useRef(null)

  useClickOutside(navRef, () => setOpenMenu(null), openMenu !== null)
  useClickOutside(userMenuRef, () => setUserMenuOpen(false), userMenuOpen)
  useClickOutside(langRef, () => setLangOpen(false), langOpen)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close every transient surface on navigation.
  useEffect(() => {
    setMobileOpen(false)
    setOpenMenu(null)
    setUserMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Cmd/Ctrl+K opens search from anywhere.
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate('/')
  }

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
          'sticky top-0 z-50 transition-all duration-300',
          scrolled
            ? 'border-b border-ink-200/70 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/85'
            : 'border-b border-transparent bg-white/60 backdrop-blur-md dark:bg-ink-950/60',
        )}
      >
        <nav ref={navRef} className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:h-[4.5rem] lg:gap-6 lg:px-8">
          <Logo />

          {/* Desktop navigation */}
          <ul className="ml-2 hidden items-center gap-0.5 lg:flex">
            {NAV_LINKS.map((link) => {
              const hasPanel = link.mega || link.dropdown
              const isOpen = openMenu === link.label

              if (!hasPanel) {
                return (
                  <li key={link.label}>
                    <NavLink
                      to={link.to}
                      end={link.to === '/'}
                      className={({ isActive }) =>
                        cn(
                          'rounded-lg px-3 py-2 text-sm font-semibold transition',
                          isActive
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/10 dark:hover:text-white',
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  </li>
                )
              }

              return (
                <li key={link.label} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenMenu(isOpen ? null : link.label)}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    className={cn(
                      'flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition',
                      isOpen || pathname.startsWith(link.to)
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/10 dark:hover:text-white',
                    )}
                  >
                    {link.label}
                    <ChevronDown className={cn('size-3.5 transition-transform', isOpen && 'rotate-180')} aria-hidden="true" />
                  </button>

                  {isOpen && link.mega && <MegaMenu onNavigate={() => setOpenMenu(null)} />}

                  {isOpen && link.dropdown && (
                    <div className="absolute left-0 top-full mt-2 w-56 animate-scale-in overflow-hidden rounded-2xl border border-ink-200/70 bg-white p-1.5 shadow-card dark:border-white/10 dark:bg-ink-900">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="block rounded-xl px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-brand-50 hover:text-brand-700 dark:text-ink-300 dark:hover:bg-white/5 dark:hover:text-white"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 rounded-xl border border-ink-200 py-2 pl-3 pr-2 text-sm text-ink-400 transition hover:border-brand-300 hover:text-ink-600 dark:border-white/10 dark:hover:border-brand-500/40 dark:hover:text-ink-200 md:flex lg:w-56"
              aria-label="Search events"
            >
              <Search className="size-4 shrink-0" aria-hidden="true" />
              <span className="hidden lg:inline">Search events…</span>
              <kbd className="ml-auto hidden rounded-md border border-ink-200 px-1.5 py-0.5 text-[10px] font-semibold dark:border-white/15 lg:block">
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid size-10 place-items-center rounded-xl text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/10 md:hidden"
              aria-label="Search events"
            >
              <Search className="size-5" />
            </button>

            {/* Language */}
            <div ref={langRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                aria-expanded={langOpen}
                aria-label={`Language: ${language.label}`}
                className="grid size-10 place-items-center rounded-xl text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/10"
              >
                <Globe className="size-5" />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 animate-scale-in overflow-hidden rounded-2xl border border-ink-200/70 bg-white p-1.5 shadow-card dark:border-white/10 dark:bg-ink-900">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang)
                        setLangOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition',
                        lang.code === language.code
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                          : 'text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-white/5',
                      )}
                    >
                      <span aria-hidden="true">{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <ThemeToggle className="hidden sm:grid" />

            <Link
              to="/dashboard/saved"
              className="relative hidden size-10 place-items-center rounded-xl text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/10 sm:grid"
              aria-label={`Saved events (${wishlistCount})`}
            >
              <Heart className="size-5" />
              {wishlistCount > 0 && (
                <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-accent-500 px-1 text-[10px] font-bold leading-4 text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/checkout"
              className="relative grid size-10 place-items-center rounded-xl text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/10"
              aria-label={`Booking cart (${summary.count} tickets)`}
            >
              <Ticket className="size-5" />
              {summary.count > 0 && (
                <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold leading-4 text-white">
                  {summary.count}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div ref={userMenuRef} className="relative ml-1">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-expanded={userMenuOpen}
                  aria-label="Account menu"
                  className="flex items-center gap-2 rounded-xl p-1 transition hover:bg-ink-100 dark:hover:bg-white/10"
                >
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                  <ChevronDown className={cn('hidden size-3.5 text-ink-400 transition-transform lg:block', userMenuOpen && 'rotate-180')} aria-hidden="true" />
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
                        { label: 'Wallet', to: '/dashboard/wallet', icon: Wallet },
                        { label: 'Profile', to: '/dashboard/profile', icon: User },
                        ...(isOrganizer
                          ? [{ label: 'Organizer panel', to: '/organizer', icon: Settings }]
                          : []),
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
              <Button to="/login" variant="ghost" size="sm" className="ml-1 hidden lg:inline-flex">
                Sign in
              </Button>
            )}

            <Button
              to={isOrganizer ? '/organizer/events/new' : '/organizer'}
              size="sm"
              iconLeft={Plus}
              className="ml-1 hidden xl:inline-flex"
            >
              Create event
            </Button>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid size-10 place-items-center rounded-xl text-ink-700 transition hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-white/10 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

/* -------------------------------------------------------------- mega menu */

function MegaMenu({ onNavigate }) {
  const shortcuts = [
    { label: 'All events', to: '/events', description: 'Browse the full catalogue' },
    { label: 'Free events', to: '/events?price=free', description: 'No ticket cost' },
    { label: 'Online events', to: '/events?type=online', description: 'Join from anywhere' },
    { label: 'Near me', to: '/events?near=me', description: 'Sorted by distance' },
  ]

  return (
    <div className="absolute left-1/2 top-full z-50 mt-2 w-[min(60rem,calc(100vw-3rem))] -translate-x-1/2 animate-scale-in rounded-3xl border border-ink-200/70 bg-white p-6 shadow-card dark:border-white/10 dark:bg-ink-900">
      <div className="grid gap-6 lg:grid-cols-[1fr_16rem]">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-400">Browse by category</p>
          <div className="grid grid-cols-2 gap-1 xl:grid-cols-3">
            {categories.slice(0, 12).map((category) => (
              <Link
                key={category.id}
                to={`/events?category=${category.id}`}
                onClick={onNavigate}
                className="group flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-brand-50 dark:hover:bg-white/5"
              >
                <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white', category.color)}>
                  <category.icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold group-hover:text-brand-700 dark:group-hover:text-white">
                    {category.name}
                  </span>
                  <span className="block text-xs text-ink-400">{category.count} events</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:border-l lg:border-ink-200/70 lg:pl-6 dark:lg:border-white/10">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-ink-400">Shortcuts</p>
          {shortcuts.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className="rounded-xl p-2.5 transition hover:bg-brand-50 dark:hover:bg-white/5"
            >
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="block text-xs text-ink-400">{item.description}</span>
            </Link>
          ))}

          <div className="mt-auto rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white">
            <Badge tone="glass" size="sm" className="mb-2">
              For organizers
            </Badge>
            <p className="text-sm font-bold">List your event free</p>
            <p className="mt-1 text-xs text-white/75">Sell tickets, scan QR codes and get paid out fast.</p>
            <Button to="/organizer" size="xs" variant="accent" className="mt-3" onClick={onNavigate}>
              Get started
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ mobile menu */

function MobileMenu({ open, onClose, onLogout }) {
  const { user, isAuthenticated } = useAuth()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] lg:hidden">
      <div className="absolute inset-0 animate-fade-in bg-ink-950/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="absolute right-0 top-0 flex h-full w-[min(22rem,88vw)] animate-scale-in flex-col bg-white shadow-card dark:bg-ink-950">
        <div className="flex items-center justify-between border-b border-ink-200/70 p-4 dark:border-white/10">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-xl text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isAuthenticated && (
            <Link to="/dashboard" className="mb-4 flex items-center gap-3 rounded-2xl bg-ink-50 p-3 dark:bg-white/5">
              <Avatar src={user.avatar} name={user.name} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{user.name}</p>
                <p className="truncate text-xs text-ink-500 dark:text-ink-400">View dashboard</p>
              </div>
            </Link>
          )}

          <nav className="space-y-1">
            {NAV_LINKS.map((link) => (
              <div key={link.label}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-xl px-3 py-2.5 text-base font-semibold transition',
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                        : 'text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-white/5',
                    )
                  }
                >
                  {link.label}
                </NavLink>
                {link.dropdown && (
                  <div className="ml-3 mt-1 space-y-0.5 border-l border-ink-200/70 pl-3 dark:border-white/10">
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="block rounded-lg px-3 py-2 text-sm text-ink-500 transition hover:text-brand-600 dark:text-ink-400 dark:hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="mt-6 border-t border-ink-200/70 pt-4 dark:border-white/10">
            <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-ink-400">Categories</p>
            <div className="grid grid-cols-2 gap-1">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  to={`/events?category=${category.id}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/5"
                >
                  <category.icon className="size-4 shrink-0 text-brand-500" aria-hidden="true" />
                  <span className="truncate">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-ink-200/70 p-4 dark:border-white/10">
          <div className="flex items-center justify-between pb-1">
            <span className="text-sm font-semibold text-ink-600 dark:text-ink-300">Appearance</span>
            <ThemeToggle />
          </div>
          {isAuthenticated ? (
            <Button variant="outline" fullWidth iconLeft={LogOut} onClick={onLogout}>
              Sign out
            </Button>
          ) : (
            <>
              <Button to="/login" variant="outline" fullWidth>
                Sign in
              </Button>
              <Button to="/register" fullWidth>
                Create account
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
