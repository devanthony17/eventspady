import { Link } from 'react-router-dom'
import { Check, Quote } from 'lucide-react'
import { Logo } from '@components/layout/Logo'
import { Avatar } from '@components/ui/Avatar'
import { useLandingCms } from '@hooks/api'

const DEFAULT_PERKS = [
  'All your tickets and QR passes in one pocket',
  'Instant Mobile Money (MTN MoMo & Telecel Cash) checkout',
  'Real-time gate check-in with zero delay',
  'Save favorite events and follow local organizers',
]

/** Split layout shared by sign in, sign up and password recovery with right-side photographic visuals. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  image = '/images/events/all-white-party.jpg',
  imageAlt = 'Events in Ghana',
  headline,
  badge = 'Eventspady Ghana',
  perks = DEFAULT_PERKS,
  quoteIndex = 0,
}) {
  const { data: cmsData } = useLandingCms()
  const list = cmsData?.testimonials || []
  const quote = list[quoteIndex] || list[0] || null

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-5 py-8 sm:px-8 lg:px-12 bg-white dark:bg-ink-950">
        <div className="mb-10 flex items-center justify-between gap-4">
          <Logo />
          <Link
            to="/"
            className="text-sm font-semibold text-ink-500 transition hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-400"
          >
            Back to site
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <h1 className="text-3xl font-extrabold sm:text-[2rem] text-ink-900 dark:text-white">{title}</h1>
          {subtitle && <p className="mt-2 text-ink-500 dark:text-ink-400">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>

        {footer && <div className="mx-auto mt-10 w-full max-w-md text-center text-sm">{footer}</div>}
      </div>

      {/* Brand & photographic image side */}
      <div className="relative hidden overflow-hidden bg-ink-950 lg:block">
        {image && (
          <img
            src={image}
            alt={imageAlt}
            className="absolute inset-0 size-full object-cover transition-transform duration-1000 hover:scale-105"
          />
        )}
        {/* Layered cinematic gradients for extreme legibility and glass aesthetic */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/75 to-ink-950/40 backdrop-blur-[1px]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-ink-950/90 via-transparent to-brand-950/60"
          aria-hidden="true"
        />
        <div
          className="absolute -right-20 top-1/4 size-96 rounded-full bg-brand-500/20 blur-[100px]"
          aria-hidden="true"
        />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div>
            {badge && (
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-300 backdrop-blur-md shadow-sm">
                {badge}
              </span>
            )}
            <h2 className="max-w-md text-balance text-3xl font-extrabold leading-tight xl:text-4xl text-white drop-shadow-md">
              {headline || 'Join 24,000+ people booking better events in Wa'}
            </h2>
            <ul className="mt-8 space-y-3.5">
              {perks.map((perk) => (
                <li key={perk} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-500 text-white shadow-sm ring-2 ring-brand-400/40">
                    <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-white/95 drop-shadow-sm">{perk}</span>
                </li>
              ))}
            </ul>
          </div>

          {quote && quote.quote && (
            <figure className="rounded-2xl border border-white/15 bg-ink-950/70 p-6 backdrop-blur-xl shadow-2xl">
              <Quote className="mb-3 size-6 text-accent-400" aria-hidden="true" />
              <blockquote className="text-pretty text-sm leading-relaxed text-white/90 font-medium">
                “{quote.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <Avatar src={quote.avatar} name={quote.name} size="sm" />
                <div>
                  <p className="text-sm font-bold text-white">{quote.name}</p>
                  <p className="text-xs text-white/65">{quote.role}</p>
                </div>
              </figcaption>
            </figure>
          )}
        </div>
      </div>
    </div>
  )
}

/** Google OAuth 2.0 button — toggled by the admin's Google Sign-in setting. */
export function GoogleButton({ onClick, loading, label = 'Continue with Google' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-800 transition hover:bg-ink-50 disabled:opacity-60 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
    >
      <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51Z"
        />
      </svg>
      {loading ? 'Connecting…' : label}
    </button>
  )
}

export function AuthDivider({ label = 'or continue with email' }) {
  return (
    <div className="my-6 flex items-center gap-4">
      <span className="h-px flex-1 bg-ink-200 dark:bg-white/10" />
      <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">{label}</span>
      <span className="h-px flex-1 bg-ink-200 dark:bg-white/10" />
    </div>
  )
}
