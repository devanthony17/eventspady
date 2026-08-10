import { useState } from 'react'
import {
  ArrowRight,
  BadgePercent,
  CalendarPlus,
  CreditCard,
  QrCode,
  ScanLine,
  Search,
  Ticket,
  Users,
  Wallet,
  WifiOff,
} from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { PageHero } from '@components/layout/PageHero'
import { Container, Section, SectionHeading } from '@components/ui/Section'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Tabs } from '@components/ui/Tabs'
import { Accordion } from '@components/ui/Accordion'
import { faqGroups } from '@data/faq'
import { PAYMENT_METHODS, TICKET_TYPES } from '@lib/constants'
import { cn } from '@lib/utils'

const ATTENDEE_STEPS = [
  { icon: Search, title: 'Search', description: 'Filter by city, category, date or price — or let us sort by distance from you.' },
  { icon: Ticket, title: 'Choose tickets', description: 'Free, paid, one-day or all-days. Add a coupon code if you have one.' },
  { icon: CreditCard, title: 'Pay', description: 'Card, PayPal, UPI, mobile money, wallet balance — or cash at the door where offered.' },
  { icon: QrCode, title: 'Walk in', description: 'Your QR ticket arrives instantly. Show it at the door and you are in.' },
]

const ORGANIZER_STEPS = [
  { icon: CalendarPlus, title: 'List your event', description: 'Name, date, location, description and cover image. Publish or save a draft.' },
  { icon: Ticket, title: 'Define tickets', description: 'Set types, prices, quantities, per-order limits and when sales close.' },
  { icon: BadgePercent, title: 'Add offers', description: 'Create coupons with percentage or flat discounts, capped and time-limited.' },
  { icon: ScanLine, title: 'Scan and get paid', description: 'Check guests in with the scanner, then withdraw your payout after the event.' },
]

export default function HowItWorks() {
  const [audience, setAudience] = useState('attendee')
  const steps = audience === 'attendee' ? ATTENDEE_STEPS : ORGANIZER_STEPS

  return (
    <>
      <Seo
        title="How it works"
        description="How Eventspady works for attendees and organizers — from finding an event and paying, to selling tickets, scanning QR codes at the door and getting paid out."
        keywords="how eventspady works, sell tickets online, qr ticket check in, event payment processing"
      />

      <PageHero
        tone="dark"
        eyebrow="How it works"
        title="From a listing to a queue that actually moves"
        description="Two sides of the same platform: attendees who want to be inside, and organizers who need the operation to disappear into the background."
        breadcrumbs={[{ label: 'How it works' }]}
      />

      <Section>
        <Container>
          <Tabs
            tabs={[
              { id: 'attendee', label: 'For attendees' },
              { id: 'organizer', label: 'For organizers' },
            ]}
            active={audience}
            onChange={setAudience}
            variant="pill"
            className="mx-auto mb-12 w-full max-w-md"
          />

          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title} className="relative">
                <span className="mb-5 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lift">
                  <step.icon className="size-6" aria-hidden="true" />
                </span>
                <span className="absolute right-0 top-0 text-5xl font-extrabold text-ink-100 dark:text-white/[.06]">
                  {i + 1}
                </span>
                <h3 className="text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-500 dark:text-ink-400">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* Ticket types */}
      <Section className="bg-ink-50 dark:bg-white/[.02]">
        <Container>
          <SectionHeading
            eyebrow="Ticket types"
            title="Four ways to sell entry"
            description="Mix them freely on a single event — a festival can sell day passes and weekend passes side by side."
            align="center"
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(TICKET_TYPES).map(([id, meta]) => (
              <article key={id} className="surface p-6 text-center">
                <span className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                  <Ticket className="size-6" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold">{meta.label}</h3>
                <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">{meta.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* Payments */}
      <Section>
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Payments"
                title="Take money the way your audience actually pays"
                description="Five online channels plus cash at the door. Enable only what your audience uses — a cluttered checkout costs more than a missing option."
                className="mb-6"
              />

              <ul className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <li key={method.id} className="flex items-start gap-3">
                    <span
                      className={cn(
                        'mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg',
                        method.mode === 'offline'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                          : 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
                      )}
                    >
                      {method.id === 'wallet' ? (
                        <Wallet className="size-4" aria-hidden="true" />
                      ) : (
                        <CreditCard className="size-4" aria-hidden="true" />
                      )}
                    </span>
                    <span>
                      <span className="block text-sm font-bold">{method.label}</span>
                      <span className="block text-xs text-ink-500 dark:text-ink-400">{method.blurb}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Scanner explainer */}
            <div id="scanner" className="scroll-mt-24">
              <div className="surface overflow-hidden">
                <div className="border-b border-ink-200/70 bg-gradient-to-br from-brand-600 to-ink-950 p-7 text-white dark:border-white/10">
                  <Badge tone="glass" size="sm" className="mb-3">
                    Scanner app
                  </Badge>
                  <h3 className="text-2xl font-extrabold">QR check-in that works without signal</h3>
                  <p className="mt-2 text-sm text-white/75">
                    Venues have terrible reception. The scanner caches the guest list before doors, validates
                    locally and syncs when it reconnects.
                  </p>
                </div>

                <div className="divide-y divide-ink-200/70 dark:divide-white/10">
                  {[
                    { icon: QrCode, title: 'Unique code per ticket', description: 'Generated the moment an order is placed, encoding a signed token — never personal data.' },
                    { icon: ScanLine, title: 'Three checks per scan', description: 'Valid for this event, not already used, and inside the permitted window.' },
                    { icon: WifiOff, title: 'Offline first', description: 'Duplicate scans across devices are reconciled on sync and flagged for the door lead.' },
                    { icon: Users, title: '250 guests per hour, per lane', description: 'Two lanes and a floating supervisor clear a thousand-person door in well under an hour.' },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4 p-5">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-600 dark:bg-white/10 dark:text-ink-300">
                        <item.icon className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-bold">{item.title}</p>
                        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section className="bg-ink-50 dark:bg-white/[.02]">
        <Container size="narrow">
          <SectionHeading eyebrow="Questions" title="The things people ask most" align="center" />
          <Accordion
            items={audience === 'attendee' ? faqGroups[0].items : faqGroups[3].items}
            defaultOpen={[0]}
          />

          <div className="mt-10 text-center">
            <Button to="/faq" variant="outline" iconRight={ArrowRight}>
              Read the full FAQ
            </Button>
          </div>
        </Container>
      </Section>
    </>
  )
}
