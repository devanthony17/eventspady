import { Link } from 'react-router-dom'
import { Check, Quote } from 'lucide-react'
import { Logo } from '@components/layout/Logo'
import { Avatar } from '@components/ui/Avatar'
import { testimonials } from '@data/testimonials'

const PERKS = [
  'All your tickets and QR codes in one place',
  'Instant refunds straight to your wallet',
  'Reminders before every event you book',
  'Save events and follow your favourite organizers',
]

/** Split layout shared by sign in, sign up and password recovery. */
export function AuthShell({ title, subtitle, children, footer }) {
  const quote = testimonials[3]

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-5 py-8 sm:px-8 lg:px-12">
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
          <h1 className="text-3xl font-extrabold sm:text-[2rem]">{title}</h1>
          {subtitle && <p className="mt-2 text-ink-500 dark:text-ink-400">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>

        {footer && <div className="mx-auto mt-10 w-full max-w-md text-center text-sm">{footer}</div>}
      </div>

      {/* Brand side */}
      <div className="relative hidden overflow-hidden bg-ink-950 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-800 via-brand-950 to-ink-950" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-grid-dark [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_40%_30%,black,transparent_70%)]"
          aria-hidden="true"
        />
        <div className="absolute -right-24 top-1/4 size-96 rounded-full bg-accent-500/20 blur-[110px]" aria-hidden="true" />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div>
            <h2 className="max-w-sm text-balance text-3xl font-extrabold leading-tight xl:text-4xl">
              Join 92,000 people booking better nights out
            </h2>
            <ul className="mt-8 space-y-3.5">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/15">
                    <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span className="text-sm text-white/80">{perk}</span>
                </li>
              ))}
            </ul>
          </div>

          <figure className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <Quote className="mb-3 size-6 text-accent-400" aria-hidden="true" />
            <blockquote className="text-pretty text-sm leading-relaxed text-white/85">“{quote.quote}”</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <Avatar src={quote.avatar} name={quote.name} size="sm" />
              <div>
                <p className="text-sm font-bold">{quote.name}</p>
                <p className="text-xs text-white/55">{quote.role}</p>
              </div>
            </figcaption>
          </figure>
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
