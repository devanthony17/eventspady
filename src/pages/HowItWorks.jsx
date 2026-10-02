import { useState } from 'react'
import {
  ArrowRight,
  BadgePercent,
  CalendarPlus,
  CreditCard,
  QrCode,
  ScanLine,
  Search,
  Users,
  Smartphone,
  WifiOff,
  UserCheck,
} from 'lucide-react'
import { Ticket, Sparkles } from '@components/icons/AppIcons'
import { Seo } from '@components/ui/Seo'
import { PageHero } from '@components/layout/PageHero'
import { Container, Section, SectionHeading } from '@components/ui/Section'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Accordion } from '@components/ui/Accordion'
import { faqGroups } from '@data/faq'
import { PAYMENT_METHODS, TICKET_TYPES } from '@lib/constants'
import { cn } from '@lib/utils'
import { useAos } from '@hooks/useAos'

const ATTENDEE_STEPS = [
  {
    step: '01',
    icon: Search,
    title: 'Search & Discover',
    subtitle: 'Find events',
    description: 'Filter by city, category, date or price — or let us sort by distance from you in Wa and Upper West.',
  },
  {
    step: '02',
    icon: Ticket,
    title: 'Choose Your Pass',
    subtitle: 'Select ticket type',
    description: 'Free, paid, standard, VIP or all-day passes. Apply discount coupons instantly in your checkout summary.',
  },
  {
    step: '03',
    icon: CreditCard,
    title: 'Instant MoMo Pay',
    subtitle: 'Zero payment friction',
    description: 'MTN Mobile Money, Telecel Cash, card — or reserve for pay at the gate where the organizer enables it.',
  },
  {
    step: '04',
    icon: QrCode,
    title: 'Instant QR Entry',
    subtitle: 'Walk in smoothly',
    description: 'Your cryptographically signed digital QR ticket arrives immediately on your phone. Flash at the door and you are in.',
  },
]

const ORGANIZER_STEPS = [
  {
    step: '01',
    icon: CalendarPlus,
    title: 'List Your Event',
    subtitle: 'Setup in 2 minutes',
    description: 'Name, date, venue, description and cover artwork. Publish live immediately or save a draft to finish later.',
  },
  {
    step: '02',
    icon: Ticket,
    title: 'Define Tiered Passes',
    subtitle: 'Control inventory',
    description: 'Set ticket tiers, prices in GHS (GH₵), maximum order quantities, and custom booking deadlines.',
  },
  {
    step: '03',
    icon: BadgePercent,
    title: 'Create Promo Codes',
    subtitle: 'Boost ticket sales',
    description: 'Offer percentage or flat discounts, time-limited early bird perks, and track which channels convert best.',
  },
  {
    step: '04',
    icon: ScanLine,
    title: 'Scan & Automated Payout',
    subtitle: 'Sub-second validation',
    description: 'Admit guests in offline mode using the QR scanner, then withdraw automated MoMo payouts after the event.',
  },
]

export default function HowItWorks() {
  const [audience, setAudience] = useState('attendee')
  const steps = audience === 'attendee' ? ATTENDEE_STEPS : ORGANIZER_STEPS

  // Initialize Animate-On-Scroll reveals
  useAos({ threshold: 0.1, once: true })

  // Left-side payment methods without Flutterwave
  const displayPaymentMethods = PAYMENT_METHODS.filter((m) => m.id !== 'flutterwave')

  return (
    <>
      <Seo
        title="How it works"
        description="How Eventspady works for attendees and organizers — from finding an event and paying, to selling tickets, scanning QR codes at the door and getting paid out in Wa and the Upper West."
        keywords="how eventspady works, sell tickets online, qr ticket check in, event payment processing, wa events"
      />

      {/* Hero with authentic background image */}
      <PageHero
        tone="dark"
        bgImage="/images/hero/how-it-works.jpg"
        imageAlt="Wa Cultural Festival ticketing check-in gate and crowd entry"
        eyebrow="How it works"
        title="From a listing to a queue that actually moves"
        description="Two sides of the same platform: attendees who want to be inside, and organizers who need the operation to disappear into the background."
        breadcrumbs={[{ label: 'How it works' }]}
      >
        <div className="flex flex-wrap gap-3" data-aos="fade-up" data-aos-delay="200">
          <Button to="/events" size="lg" iconRight={ArrowRight}>
            Explore events
          </Button>
          <Button
            to="/organizer"
            size="lg"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/15 hover:text-white"
          >
            Create an event
          </Button>
        </div>
      </PageHero>

      {/* Enhanced Audience Toggle & Interactive Step Cards */}
      <Section className="relative overflow-hidden">
        <Container>
          {/* Enhanced Segmented Toggle Control */}
          <div className="mx-auto mb-10 max-w-xl text-center" data-aos="fade-up">
            <div className="inline-flex items-center rounded-2xl border border-ink-200/80 bg-ink-100/90 p-1.5 shadow-soft backdrop-blur-md dark:border-white/10 dark:bg-ink-900/90">
              <button
                type="button"
                onClick={() => setAudience('attendee')}
                className={cn(
                  'group relative flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-300',
                  audience === 'attendee'
                    ? 'bg-white text-ink-950 shadow-md ring-1 ring-ink-950/5 dark:bg-brand-600 dark:text-white dark:ring-white/10 scale-[1.02]'
                    : 'text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white',
                )}
              >
                <span
                  className={cn(
                    'grid size-8 place-items-center rounded-lg transition-colors',
                    audience === 'attendee'
                      ? 'bg-brand-50 text-brand-600 dark:bg-white/20 dark:text-white'
                      : 'bg-ink-200/70 text-ink-500 dark:bg-white/10 dark:text-ink-400 group-hover:bg-brand-100 group-hover:text-brand-700',
                  )}
                >
                  <UserCheck className="size-4" />
                </span>
                <div className="text-left">
                  <span className="block leading-tight font-extrabold">For Attendees</span>
                  <span className="block text-[11px] font-normal opacity-75">Book & walk in</span>
                </div>
                {audience === 'attendee' && (
                  <span className="ml-1 size-2 rounded-full bg-brand-500 dark:bg-white animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setAudience('organizer')}
                className={cn(
                  'group relative flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-300',
                  audience === 'organizer'
                    ? 'bg-white text-ink-950 shadow-md ring-1 ring-ink-950/5 dark:bg-brand-600 dark:text-white dark:ring-white/10 scale-[1.02]'
                    : 'text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white',
                )}
              >
                <span
                  className={cn(
                    'grid size-8 place-items-center rounded-lg transition-colors',
                    audience === 'organizer'
                      ? 'bg-brand-50 text-brand-600 dark:bg-white/20 dark:text-white'
                      : 'bg-ink-200/70 text-ink-500 dark:bg-white/10 dark:text-ink-400 group-hover:bg-brand-100 group-hover:text-brand-700',
                  )}
                >
                  <Sparkles className="size-4" />
                </span>
                <div className="text-left">
                  <span className="block leading-tight font-extrabold">For Organizers</span>
                  <span className="block text-[11px] font-normal opacity-75">Sell & scan gates</span>
                </div>
                {audience === 'organizer' && (
                  <span className="ml-1 size-2 rounded-full bg-brand-500 dark:bg-white animate-pulse" />
                )}
              </button>
            </div>

            {/* Contextual Subtitle */}
            <p className="mt-4 text-pretty text-sm text-ink-500 dark:text-ink-400">
              {audience === 'attendee'
                ? 'Follow 4 simple steps to explore, book with Mobile Money, and enter venues without queues.'
                : 'Follow 4 steps to launch ticketing in Wa, validate QR codes with zero delay, and receive automatic payouts.'}
            </p>
          </div>

          {/* 4 Step Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div
                key={`${audience}-${step.title}`}
                data-aos="fade-up"
                data-aos-delay={`${(i + 1) * 100}`}
                className="surface group relative flex flex-col justify-between p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-card"
              >
                {/* Decorative background step number */}
                <span className="pointer-events-none absolute right-4 top-3 select-none text-5xl sm:text-6xl font-black text-ink-100 dark:text-white/[.04] transition-colors group-hover:text-brand-500/10">
                  {step.step}
                </span>

                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <span className="grid size-13 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lift transition-transform duration-300 group-hover:scale-110">
                      <step.icon className="size-6" aria-hidden="true" />
                    </span>
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                      Step {step.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-ink-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-brand-600 dark:text-brand-300">
                    {step.subtitle}
                  </p>
                  <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-500 dark:text-ink-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Ticket types */}
      <Section className="bg-ink-50 dark:bg-white/[.02]">
        <Container>
          <div data-aos="fade-up">
            <SectionHeading
              eyebrow="Ticket types"
              title="Four ways to sell entry"
              description="Mix them freely on a single event — a festival can sell day passes and weekend passes side by side."
              align="center"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-10">
            {Object.entries(TICKET_TYPES).map(([id, meta], idx) => (
              <article
                key={id}
                data-aos="zoom-in-up"
                data-aos-delay={`${(idx + 1) * 100}`}
                className="surface p-6 sm:p-7 text-center transition-all duration-300 hover:border-brand-500/40 hover:-translate-y-1 hover:shadow-soft"
              >
                <span className="mx-auto mb-5 grid size-13 place-items-center rounded-2xl bg-brand-100 text-brand-700 shadow-sm dark:bg-brand-500/15 dark:text-brand-300">
                  <Ticket className="size-6" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold text-ink-900 dark:text-white">{meta.label}</h3>
                <p className="mt-2 text-sm text-ink-500 dark:text-ink-400 leading-relaxed">{meta.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* Payments & Scanner */}
      <Section>
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left side: Payments channels (Flutterwave removed) */}
            <div data-aos="fade-right">
              <SectionHeading
                eyebrow="Payments"
                title="Take money the way your audience actually pays"
                description="Online channels plus cash at the door. Enable only what your audience uses — a cluttered checkout costs more than a missing option."
                className="mb-6"
              />

              <ul className="space-y-3.5">
                {displayPaymentMethods.map((method, idx) => (
                  <li
                    key={method.id}
                    data-aos="fade-right"
                    data-aos-delay={`${(idx + 1) * 100}`}
                    className="surface p-4 sm:p-4.5 flex items-center justify-between gap-3.5 transition-all duration-300 hover:border-brand-500/40 hover:shadow-soft"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={cn(
                          'grid size-10 shrink-0 place-items-center rounded-xl shadow-sm',
                          method.mode === 'offline'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                            : 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
                        )}
                      >
                        {method.id.includes('momo') || method.id.includes('telecel') ? (
                          <Smartphone className="size-5" aria-hidden="true" />
                        ) : (
                          <CreditCard className="size-5" aria-hidden="true" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <span className="block text-sm font-bold text-ink-900 dark:text-white">
                          {method.label}
                        </span>
                        <span className="block text-xs text-ink-500 dark:text-ink-400 truncate">
                          {method.blurb}
                        </span>
                      </div>
                    </div>

                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider',
                        method.mode === 'offline'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                          : 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
                      )}
                    >
                      {method.mode === 'offline' ? 'At gate' : 'Instant MoMo'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right side: Scanner explainer */}
            <div id="scanner" className="scroll-mt-24" data-aos="fade-left" data-aos-delay="200">
              <div className="surface overflow-hidden shadow-card">
                <div className="border-b border-ink-200/70 bg-gradient-to-br from-brand-600 via-brand-700 to-ink-950 p-7 text-white dark:border-white/10">
                  <Badge tone="glass" size="sm" className="mb-3">
                    Scanner app
                  </Badge>
                  <h3 className="text-2xl font-extrabold text-white">QR check-in that works without signal</h3>
                  <p className="mt-2 text-sm text-white/80 leading-relaxed">
                    Venues often have terrible reception. The scanner caches the guest list before doors, validates
                    locally in sub-seconds and syncs when it reconnects.
                  </p>
                </div>

                <div className="divide-y divide-ink-200/70 dark:divide-white/10">
                  {[
                    {
                      icon: QrCode,
                      title: 'Unique code per ticket',
                      description: 'Generated the moment an order is placed, encoding a signed token — never personal data.',
                    },
                    {
                      icon: ScanLine,
                      title: 'Three checks per scan',
                      description: 'Valid for this event, not already used, and inside the permitted entry window.',
                    },
                    {
                      icon: WifiOff,
                      title: 'Offline first',
                      description: 'Duplicate scans across devices are reconciled on sync and flagged immediately for the gate lead.',
                    },
                    {
                      icon: Users,
                      title: '250 guests per hour, per lane',
                      description: 'Two lanes and a floating supervisor clear a thousand-person door in well under an hour.',
                    },
                  ].map((item, idx) => (
                    <div
                      key={item.title}
                      data-aos="fade-up"
                      data-aos-delay={`${(idx + 1) * 100}`}
                      className="flex gap-4 p-5 sm:p-5.5 hover:bg-ink-50/50 dark:hover:bg-white/[.02] transition-colors"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-600 dark:bg-white/10 dark:text-ink-300">
                        <item.icon className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-ink-900 dark:text-white">{item.title}</p>
                        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400 leading-relaxed">
                          {item.description}
                        </p>
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
          <div data-aos="fade-up">
            <SectionHeading eyebrow="Questions" title="The things people ask most" align="center" />
          </div>

          <div data-aos="fade-up" data-aos-delay="150">
            <Accordion
              items={audience === 'attendee' ? faqGroups[0].items : faqGroups[3].items}
              defaultOpen={[0]}
            />
          </div>

          <div className="mt-10 text-center" data-aos="fade-up" data-aos-delay="200">
            <Button to="/faq" variant="outline" iconRight={ArrowRight}>
              Read the full FAQ
            </Button>
          </div>
        </Container>
      </Section>
    </>
  )
}
