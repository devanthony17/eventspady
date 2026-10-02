import { useState, useMemo } from 'react'
import { ArrowRight, Check, CreditCard, Minus, ShieldCheck, Zap } from 'lucide-react'
import { Ticket } from '@components/icons/AppIcons'
import { Seo } from '@components/ui/Seo'
import { PageHero } from '@components/layout/PageHero'
import { Container, Section, SectionHeading } from '@components/ui/Section'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Accordion } from '@components/ui/Accordion'
import { useAos } from '@hooks/useAos'
import { usePlans } from '@hooks/api'
import { formatCurrency, cn } from '@lib/utils'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    commission: 6,
    blurb: 'For community events and first-time organizers.',
    features: [
      'Unlimited free events',
      'All four ticket types',
      'QR check-in with the scanner app',
      'MTN MoMo and Paystack checkout',
      'Email support',
    ],
    missing: ['Custom branding', 'Priority payouts', 'Dedicated manager'],
    cta: 'Start free',
  },
  {
    id: 'growth',
    name: 'Growth',
    commission: 4,
    blurb: 'For organizers running events every month.',
    popular: true,
    features: [
      'Everything in Starter',
      'All five payment channels',
      'Coupons and offer campaigns',
      'Custom logo and primary colour',
      'Guest list and comp tickets',
      'Priority payouts (24h)',
      'Priority support',
    ],
    missing: ['Dedicated manager'],
    cta: 'Choose Growth',
  },
  {
    id: 'scale',
    name: 'Scale',
    commission: 2.5,
    blurb: 'For festivals, venues and multi-event programmes.',
    features: [
      'Everything in Growth',
      'Negotiated commission',
      'Multi-language listings',
      'Custom tax configuration',
      'API access and webhooks',
      'Dedicated account manager',
      'On-site support available',
    ],
    missing: [],
    cta: 'Talk to sales',
  },
]

const INCLUDED_IN_ALL = [
  {
    icon: Ticket,
    title: 'Zero-Fee Free Events',
    description: 'Community meetups, free workshops, and RSVPs are 100% free with 0% commission forever.',
  },
  {
    icon: Zap,
    title: 'Sub-Second QR Check-in',
    description: 'Offline-capable mobile gate scanner validates attendee tickets in under 400 milliseconds.',
  },
  {
    icon: CreditCard,
    title: 'Local MoMo & Card Gateways',
    description: 'Instant buyer payments via MTN MoMo, Telecel Cash, and Visa/Mastercard with transparent receipts.',
  },
  {
    icon: ShieldCheck,
    title: 'Automated 24h Payouts',
    description: 'Direct disbursements straight into your mobile money wallet or Ghanaian bank account without delays.',
  },
]

const FAQ = [
  { q: 'Is it really free to list an event?', a: 'Yes. Creating an account and publishing listings costs nothing. You only pay commission on tickets you actually sell, and free tickets carry no commission at all.' },
  { q: 'When do I get paid?', a: 'Payouts are released after your event completes, minus commission and any refunds. Growth and Scale plans settle within 24 hours of the event ending; Starter settles in 3–5 business days.' },
  { q: 'Who pays the commission — me or the attendee?', a: 'That is your choice. You can absorb it into your ticket price, or pass it on as a visible service fee at checkout. Either way it is itemised on every order.' },
  { q: 'What about payment processor fees?', a: 'MTN MoMo, Telecel Cash, Paystack and Flutterwave each charge their own standard processing fee, billed separately by them. Cash payments at the door carry no processor fee.' },
  { q: 'Can I switch plans?', a: 'Any time, and it takes effect on your next event. Events already on sale keep the commission rate they were published with.' },
]

export default function Pricing() {
  const { data: plansData } = usePlans()
  const plans = useMemo(() => {
    if (Array.isArray(plansData) && plansData.length > 0) return plansData
    if (Array.isArray(plansData?.plans) && plansData.plans.length > 0) return plansData.plans
    if (Array.isArray(plansData?.data) && plansData.data.length > 0) return plansData.data
    return PLANS
  }, [plansData])

  const [volume, setVolume] = useState(500)
  const [price, setPrice] = useState(120)

  const gross = volume * price

  // Initialize Animate-On-Scroll reveals
  useAos({ threshold: 0.1, once: true })

  return (
    <>
      <Seo
        title="Pricing"
        description="Eventspady is free to list. You pay commission only on tickets you sell — from 2.5% on Scale to 6% on Starter, with no monthly fee."
        keywords="event ticketing pricing, ticket platform commission, sell tickets fees"
      />

      <PageHero
        eyebrow="Pricing"
        title="Free to list. You pay when you sell."
        description="No monthly fee, no setup cost, no charge for free tickets. Commission comes out of paid ticket sales and is itemised on every single order."
        breadcrumbs={[{ label: 'Pricing' }]}
        data-aos="fade-down"
      >
        <div className="flex flex-wrap items-center gap-2.5 pt-2" data-aos="fade-up" data-aos-delay="150">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3.5 py-1.5 text-xs font-bold text-brand-700 dark:bg-brand-400/15 dark:text-brand-300">
            <Check className="size-3.5" strokeWidth={2.5} /> 0% commission on free events
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
            <Check className="size-3.5" strokeWidth={2.5} /> No setup or monthly subscription
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3.5 py-1.5 text-xs font-bold text-sky-700 dark:bg-sky-400/15 dark:text-sky-300">
            <Check className="size-3.5" strokeWidth={2.5} /> Fast MoMo & bank payouts
          </span>
        </div>
      </PageHero>

      {/* Plans */}
      <Section>
        <Container>
          <div className="mx-auto mb-10 max-w-2xl text-center" data-aos="fade-up">
            <SectionHeading
              eyebrow="Simple commission"
              title="Pick the tier designed for your event"
              description="Transparent rates with no hidden surprises. Free events never incur commission, and paid tickets are only billed when sold."
              align="center"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan, idx) => (
              <article
                key={plan.id}
                data-aos={plan.popular ? 'zoom-in-up' : 'fade-up'}
                data-aos-delay={`${(idx + 1) * 100}`}
                className={cn(
                  'relative flex flex-col rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-1',
                  plan.popular
                    ? 'border-brand-500 bg-white shadow-lift ring-2 ring-brand-500/20 dark:bg-ink-900 lg:-my-4 lg:py-11'
                    : 'border-ink-200/70 bg-white hover:border-ink-300 hover:shadow-md dark:border-white/10 dark:bg-ink-900/60 dark:hover:border-white/20',
                )}
              >
                {plan.popular && (
                  <Badge tone="brand" size="md" className="absolute -top-3 left-1/2 -translate-x-1/2 shadow-sm">
                    Most popular
                  </Badge>
                )}

                <h2 className="text-xl font-extrabold">{plan.name}</h2>
                <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{plan.blurb}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold tracking-tight">{plan.commission}%</span>
                  <span className="text-sm text-ink-500 dark:text-ink-400">per paid ticket</span>
                </div>
                <p className="mt-1 text-xs text-ink-400">No monthly fee · free tickets always free</p>

                <ul className="mt-7 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                        <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                      </span>
                      <span className="text-ink-600 dark:text-ink-300">{feature}</span>
                    </li>
                  ))}
                  {plan.missing.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm opacity-50">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-ink-100 text-ink-400 dark:bg-white/10">
                        <Minus className="size-3" strokeWidth={3} aria-hidden="true" />
                      </span>
                      <span className="text-ink-500 line-through dark:text-ink-400">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  to={plan.id === 'scale' ? '/contact' : '/organizer'}
                  fullWidth
                  size="lg"
                  variant={plan.popular ? 'primary' : 'outline'}
                  className="mt-7"
                >
                  {plan.cta}
                </Button>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* Included in every plan */}
      <Section className="border-t border-ink-100 bg-ink-50/50 py-12 dark:border-white/5 dark:bg-white/[.01]">
        <Container>
          <div className="mb-8 text-center" data-aos="fade-up">
            <p className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Universal Features
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-ink-900 dark:text-white sm:text-2xl">
              Included in every plan with zero extra cost
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INCLUDED_IN_ALL.map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  data-aos="fade-up"
                  data-aos-delay={`${(idx + 1) * 100}`}
                  className="rounded-2xl border border-ink-200/70 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm dark:border-white/10 dark:bg-ink-900/50"
                >
                  <div className="mb-3 grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-sm font-bold text-ink-900 dark:text-white">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-ink-500 dark:text-ink-400">{item.description}</p>
                </div>
              )
            })}
          </div>
        </Container>
      </Section>

      {/* Calculator */}
      <Section className="bg-ink-50 dark:bg-white/[.02]">
        <Container size="narrow">
          <div data-aos="fade-up">
            <SectionHeading
              eyebrow="Estimate"
              title="What would you actually keep?"
              description="Drag the sliders to see your payout under each plan. Processor fees are billed separately by the payment provider."
              align="center"
            />
          </div>

          <div
            className="surface mt-8 p-7 shadow-lg border border-ink-100 sm:p-9 dark:border-white/10"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="grid gap-8 sm:grid-cols-2">
              <div data-aos="fade-right" data-aos-delay="150">
                <label htmlFor="volume" className="label flex items-center justify-between">
                  <span>Tickets sold:</span>
                  <span className="rounded-md bg-brand-50 px-2 py-0.5 font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    {volume.toLocaleString()}
                  </span>
                </label>
                <input
                  id="volume"
                  type="range"
                  min="50"
                  max="5000"
                  step="50"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>

              <div data-aos="fade-left" data-aos-delay="150">
                <label htmlFor="price" className="label flex items-center justify-between">
                  <span>Ticket price:</span>
                  <span className="rounded-md bg-brand-50 px-2 py-0.5 font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    {formatCurrency(price)}
                  </span>
                </label>
                <input
                  id="price"
                  type="range"
                  min="10"
                  max="1500"
                  step="10"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>
            </div>

            <div
              className="mt-8 rounded-2xl bg-ink-50 p-5 dark:bg-white/[.04]"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="mb-4 flex items-baseline justify-between">
                <span className="text-sm font-medium text-ink-500 dark:text-ink-400">Gross ticket sales</span>
                <span className="text-2xl font-extrabold">{formatCurrency(gross)}</span>
              </div>

              <div className="space-y-3">
                {PLANS.map((plan, index) => {
                  const commission = (gross * plan.commission) / 100
                  return (
                    <div
                      key={plan.id}
                      data-aos="fade-up"
                      data-aos-delay={`${200 + (index + 1) * 50}`}
                      className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-200/70 pt-3 dark:border-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{plan.name}</span>
                        {plan.popular && (
                          <Badge tone="brand" size="sm">
                            Popular
                          </Badge>
                        )}
                        <span className="text-xs text-ink-400">
                          −{formatCurrency(commission)} commission ({plan.commission}%)
                        </span>
                      </div>
                      <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(gross - commission)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section>
        <Container size="narrow">
          <div data-aos="fade-up">
            <SectionHeading eyebrow="Pricing questions" title="Before you commit" align="center" />
          </div>
          <div data-aos="fade-up" data-aos-delay="100">
            <Accordion items={FAQ} defaultOpen={[0]} />
          </div>

          <div
            className="mt-12 flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-brand-600 to-ink-950 p-9 text-center text-white shadow-lift"
            data-aos="zoom-in-up"
            data-aos-delay="200"
          >
            <h3 className="text-2xl font-extrabold">Still deciding?</h3>
            <p className="max-w-md text-sm text-white/75">
              Publish your first event on Starter. Nothing is charged until a paid ticket is sold, and you can
              switch plans whenever you like.
            </p>
            <Button to="/organizer" variant="accent" size="lg" iconRight={ArrowRight}>
              Create your first event
            </Button>
          </div>
        </Container>
      </Section>
    </>
  )
}
