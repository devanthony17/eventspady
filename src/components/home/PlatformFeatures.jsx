import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgePercent,
  BellRing,
  Building2,
  CalendarClock,
  CreditCard,
  Flag,
  Languages,
  MailCheck,
  Palette,
  QrCode,
  ShieldCheck,
  Ticket,
  Users,
  Wallet,
} from 'lucide-react'
import { Container, Section, SectionHeading } from '@components/ui/Section'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { cn } from '@lib/utils'

const FEATURES = [
  {
    icon: Ticket,
    title: 'Four ticket types',
    description: 'Free, Paid, One Day and All Days — mix them on a single event and set per-order limits.',
    span: 'lg:col-span-2',
    tone: 'from-brand-500 to-brand-700',
  },
  {
    icon: Building2,
    title: 'Venue & online events',
    description: 'Run an in-person event, stream it, or list both formats side by side.',
    tone: 'from-sky-500 to-indigo-700',
  },
  {
    icon: QrCode,
    title: 'QR check-in',
    description: 'A unique code per ticket, validated by the scanner app — offline capable.',
    tone: 'from-emerald-500 to-teal-700',
  },
  {
    icon: CreditCard,
    title: 'Five payment channels',
    description: 'Stripe, PayPal, Flutterwave, Razorpay and wallet — plus cash at the door.',
    span: 'lg:col-span-2',
    tone: 'from-accent-500 to-rose-600',
  },
  {
    icon: CalendarClock,
    title: 'Multi-day schedules',
    description: 'Build an agenda per day with sessions, speakers and times.',
    tone: 'from-violet-500 to-purple-800',
  },
  {
    icon: Users,
    title: 'Guest management',
    description: 'Create and manage guest lists, issue comps and track who has arrived.',
    tone: 'from-fuchsia-500 to-pink-700',
  },
  {
    icon: BadgePercent,
    title: 'Coupons & offers',
    description: 'Percentage or flat discounts, scoped to one event with limits and expiry.',
    tone: 'from-amber-500 to-orange-700',
  },
  {
    icon: Wallet,
    title: 'Customer wallet',
    description: 'Refunds and credits land instantly and can be spent on the next booking.',
    tone: 'from-cyan-500 to-blue-700',
  },
  {
    icon: Languages,
    title: 'Multi-language',
    description: 'Download the base file, translate it, upload it — website and panels follow.',
    tone: 'from-lime-500 to-emerald-700',
  },
  {
    icon: BellRing,
    title: 'Notification templates',
    description: 'Dynamic variables make every message personal without extra work.',
    tone: 'from-indigo-500 to-violet-800',
  },
  {
    icon: Palette,
    title: 'Your brand',
    description: 'Set the primary colour, logo and favicon from the admin settings page.',
    tone: 'from-rose-500 to-red-700',
  },
  {
    icon: ShieldCheck,
    title: 'Verification',
    description: 'Require email, SMS or both before an account can book or publish.',
    tone: 'from-slate-500 to-slate-800',
  },
  {
    icon: Flag,
    title: 'Report & moderate',
    description: 'Attendees flag bad listings; admins review, edit, block or remove them.',
    tone: 'from-orange-500 to-red-700',
  },
  {
    icon: MailCheck,
    title: 'SMTP mail',
    description: 'Password resets, order confirmations and reminders over your own SMTP.',
    tone: 'from-teal-500 to-cyan-700',
  },
]

export function PlatformFeatures() {
  return (
    <Section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-brand-50/70 to-transparent dark:from-brand-950/40"
        aria-hidden="true"
      />

      <Container className="relative">
        <SectionHeading
          eyebrow="Everything included"
          title="One platform, from first listing to final payout"
          description="Eventspady covers the whole lifecycle — listing, selling, collecting payment, checking guests in and reporting on it afterwards."
          align="center"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className={cn(
                'group surface relative overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:shadow-card',
                feature.span,
              )}
            >
              <span
                className={cn(
                  'mb-4 grid size-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow-soft transition-transform duration-300 group-hover:scale-110',
                  feature.tone,
                )}
              >
                <feature.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="text-base font-bold">{feature.title}</h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-500 dark:text-ink-400">
                {feature.description}
              </p>
            </article>
          ))}

          {/* Closing CTA tile */}
          <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-ink-950 p-6 text-white sm:col-span-2">
            <Badge tone="glass" size="sm" className="mb-3">
              And more
            </Badge>
            <h3 className="text-lg font-bold">Taxes, commission, maintenance mode, FAQ and blog pages</h3>
            <p className="mt-2 text-sm text-white/75">
              Configure country taxes, choose a percentage or flat commission, publish help content and flip
              the site into maintenance mode with a custom message — all from the admin panel.
            </p>
            <Link
              to="/how-it-works"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-300 transition hover:text-accent-200"
            >
              See how it works
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </article>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button to="/organizer" size="lg" iconRight={ArrowRight}>
            Start selling tickets
          </Button>
          <Button to="/pricing" size="lg" variant="outline">
            See pricing
          </Button>
        </div>
      </Container>
    </Section>
  )
}
