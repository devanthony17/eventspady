import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CreditCard,
  QrCode,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react'
import { Container, Section, SectionHeading } from '@components/ui/Section'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { cn } from '@lib/utils'

const FEATURES = [
  {
    icon: Ticket,
    title: 'Four flexible ticket types',
    description: 'Free, Paid, One Day and All Days passes — mix them on a single event with custom quotas and per-order limits.',
    stat: '100% customizable',
    tone: 'from-brand-500 to-brand-700',
  },
  {
    icon: CreditCard,
    title: 'Instant MoMo & card payments',
    description: 'Direct mobile money checkout via MTN MoMo & Telecel Cash with USSD push prompts, plus debit/credit cards.',
    stat: 'Zero delay payouts',
    tone: 'from-accent-500 to-rose-600',
  },
  {
    icon: QrCode,
    title: 'Offline-ready QR check-in',
    description: 'Unique cryptographic QR codes on every ticket voucher, validated instantly at the gate even with zero internet.',
    stat: '<1s scan speed',
    tone: 'from-emerald-500 to-teal-700',
  },
  {
    icon: Users,
    title: 'Organizer command center',
    description: 'Real-time sales telemetry, guest list door tracking, one-click comp tickets, and automatic commission reconciliation.',
    stat: 'Live guest tracking',
    tone: 'from-violet-500 to-purple-800',
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
          eyebrow="Platform features"
          title="Everything you need to run successful events"
          description="From first listing and ticket sales to gate check-in and revenue reconciliation, Eventspady powers your entire lifecycle."
          align="center"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className={cn(
                'group surface relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:shadow-card',
              )}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'grid size-12 place-items-center rounded-xl bg-gradient-to-br text-white shadow-soft transition-transform duration-300 group-hover:scale-110',
                      feature.tone,
                    )}
                  >
                    <feature.icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-bold text-ink-600 dark:bg-white/10 dark:text-ink-300">
                    {feature.stat}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-500 dark:text-ink-400">
                  {feature.description}
                </p>
              </div>

              <div className="mt-6 border-t border-ink-100 pt-4 dark:border-white/10">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 group-hover:text-brand-700 dark:text-brand-400 dark:group-hover:text-brand-300">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Included on all plans
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button to="/organizer" size="lg" iconRight={ArrowRight}>
            Start selling tickets
          </Button>
          <Button to="/how-it-works" size="lg" variant="outline">
            See how it works
          </Button>
        </div>
      </Container>
    </Section>
  )
}

