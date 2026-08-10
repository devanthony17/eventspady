import { Clock, Mail, RefreshCw } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { Logo } from '@components/layout/Logo'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { SITE } from '@lib/constants'

/**
 * Shown when the admin flips Maintenance Mode on.
 * The image and message are configurable from the admin settings page.
 */
export default function Maintenance({
  message = 'We are making Eventspady a little better. Ticket sales and check-in will be back shortly — any booking you already made is safe.',
  image = '/images/maintenance.svg',
  expectedBack = 'about 30 minutes',
}) {
  return (
    <>
      <Seo title="Back soon" description="Eventspady is temporarily down for scheduled maintenance." noIndex />

      <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-white px-5 py-12 text-center dark:bg-ink-950">
        <div
          className="pointer-events-none absolute -left-32 -top-32 size-[30rem] rounded-full bg-brand-500/10 blur-[110px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-40 -right-24 size-[26rem] rounded-full bg-accent-500/10 blur-[110px]"
          aria-hidden="true"
        />

        <div className="relative w-full max-w-lg">
          <Logo className="mx-auto mb-10" />

          <img src={image} alt="" className="mx-auto mb-8 h-52 w-auto" />

          <Badge tone="warning" size="lg" className="mb-5">
            Scheduled maintenance
          </Badge>

          <h1 className="text-balance text-3xl font-extrabold sm:text-4xl">We will be right back</h1>

          <p className="mx-auto mt-4 max-w-md text-pretty leading-relaxed text-ink-500 dark:text-ink-300">
            {message}
          </p>

          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink-100 px-4 py-2 text-sm font-semibold dark:bg-white/[.06]">
            <Clock className="size-4 text-brand-500" aria-hidden="true" />
            Expected back in {expectedBack}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={() => window.location.reload()} size="lg" iconLeft={RefreshCw}>
              Try again
            </Button>
            <Button href={`mailto:${SITE.email}`} size="lg" variant="outline" iconLeft={Mail}>
              Contact support
            </Button>
          </div>

          <p className="mt-10 text-xs text-ink-400">
            Follow{' '}
            <a
              href={SITE.social.twitter}
              target="_blank"
              rel="noreferrer noopener"
              className="font-semibold text-brand-600 underline-offset-4 hover:underline dark:text-brand-400"
            >
              @eventspady
            </a>{' '}
            for live status updates.
          </p>
        </div>
      </div>
    </>
  )
}
