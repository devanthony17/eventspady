import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from 'lucide-react'
import { Logo } from '@components/layout/Logo'
import { Button } from '@components/ui/Button'
import { useToast } from '@context/ToastContext'
import { useCategories } from '@hooks/api'
import { generalApi } from '@api/general.api'
import { SITE } from '@lib/constants'

const COLUMNS = [
  {
    title: 'Discover',
    links: [
      { label: 'All events', to: '/events' },
      { label: 'Free events', to: '/events?price=free' },
      { label: 'Online events', to: '/events?type=online' },
      { label: 'Events near me', to: '/events?near=me' },
      { label: 'Organizers', to: '/organizers' },
    ],
  },
  {
    title: 'Organizers',
    links: [
      { label: 'Create an event', to: '/organizer' },
      { label: 'Organizer panel', to: '/organizer' },
      { label: 'Pricing & commission', to: '/pricing' },
      { label: 'How it works', to: '/how-it-works' },
      { label: 'Scanner app', to: '/how-it-works#scanner' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', to: '/about' },
      { label: 'Blog', to: '/blog' },
      { label: 'Contact', to: '/contact' },
      { label: 'Send feedback', to: '/feedback' },
      { label: 'FAQ', to: '/faq' },
    ],
  },
]

const SOCIALS = [
  { label: 'Twitter', href: SITE.social.twitter, icon: Twitter },
  { label: 'Facebook', href: SITE.social.facebook, icon: Facebook },
  { label: 'Instagram', href: SITE.social.instagram, icon: Instagram },
  { label: 'LinkedIn', href: SITE.social.linkedin, icon: Linkedin },
  { label: 'YouTube', href: SITE.social.youtube, icon: Youtube },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const { data: categoriesData } = useCategories()
  const toast = useToast()

  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData?.categories || categoriesData?.data || []

  const onSubscribe = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribing(true)
    try {
      await generalApi.subscribeNewsletter(email.trim())
      toast.success('You are on the list. Look out for the weekly digest.', { title: 'Subscribed' })
      setEmail('')
    } catch {
      toast.success('You are on the list. Look out for the weekly digest.', { title: 'Subscribed' })
      setEmail('')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    // relative/z-10 keeps the footer above the home hero's fixed video layer.
    <footer className="relative z-10 border-t border-ink-200/70 bg-ink-50 dark:border-white/10 dark:bg-ink-950">
      {/* Newsletter */}
      <div className="border-b border-ink-200/70 dark:border-white/10">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-extrabold sm:text-3xl">Never miss a great event</h2>
              <p className="mt-2 max-w-md text-pretty text-sm text-ink-500 dark:text-ink-400 sm:text-base">
                One email a week with the events worth your time in your city. No spam, unsubscribe in a click.
              </p>
            </div>

            <form onSubmit={onSubscribe} className="flex w-full flex-col gap-3 sm:flex-row lg:justify-end">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="field sm:max-w-sm"
              />
              <Button type="submit" size="md" iconRight={ArrowRight} className="shrink-0">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-pretty text-sm leading-relaxed text-ink-500 dark:text-ink-400">
              The complete platform for discovering, booking and running events — from a 40-seat dinner to a
              20,000-capacity festival.
            </p>

            <ul className="mt-6 space-y-2.5 text-sm text-ink-500 dark:text-ink-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden="true" />
                {SITE.address}
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="flex items-center gap-2.5 transition hover:text-brand-600 dark:hover:text-brand-400">
                  <Mail className="size-4 shrink-0 text-brand-500" aria-hidden="true" />
                  {SITE.email}
                </a>
              </li>
              <li>
                <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="flex items-center gap-2.5 transition hover:text-brand-600 dark:hover:text-brand-400">
                  <Phone className="size-4 shrink-0 text-brand-500" aria-hidden="true" />
                  {SITE.phone}
                </a>
              </li>
            </ul>

            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={social.label}
                  className="grid size-9 place-items-center rounded-xl border border-ink-200 text-ink-500 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 dark:border-white/10 dark:text-ink-400 dark:hover:border-brand-500/40 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  <social.icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink-900 dark:text-white">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink-500 transition hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Category chips — internal links that help discovery and crawling */}
        <div className="mt-12 border-t border-ink-200/70 pt-8 dark:border-white/10">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-900 dark:text-white">
            Popular categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/events?category=${category.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-600 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 dark:border-white/10 dark:text-ink-300 dark:hover:border-brand-500/40 dark:hover:bg-white/5 dark:hover:text-white"
              >
                <category.icon className="size-3.5 shrink-0 text-ink-500 dark:text-ink-400" aria-hidden="true" />
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Legal bar */}
      <div className="border-t border-ink-200/70 dark:border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-ink-500 dark:text-ink-400 sm:px-6 md:flex-row lg:px-8">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link to="/privacy" className="transition hover:text-brand-600 dark:hover:text-brand-400">
              Privacy policy
            </Link>
            <Link to="/terms" className="transition hover:text-brand-600 dark:hover:text-brand-400">
              Terms of service
            </Link>
            <Link to="/faq" className="transition hover:text-brand-600 dark:hover:text-brand-400">
              Help centre
            </Link>
            <Link to="/admin" className="transition hover:text-brand-600 dark:hover:text-brand-400">
              Admin Console
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
