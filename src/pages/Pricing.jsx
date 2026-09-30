import { useState, useMemo } from 'react'
import { ArrowRight, Check, Minus } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { PageHero } from '@components/layout/PageHero'
import { Container, Section, SectionHeading } from '@components/ui/Section'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Accordion } from '@components/ui/Accordion'
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
      />

      {/* Plans */}
      <Section>
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={cn(
                  'relative flex flex-col rounded-3xl border p-7 transition',
                  plan.popular
                    ? 'border-brand-500 bg-white shadow-lift dark:bg-ink-900 lg:-my-4 lg:py-11'
                    : 'border-ink-200/70 bg-white dark:border-white/10 dark:bg-ink-900/60',
                )}
              >
                {plan.popular && (
                  <Badge tone="brand" size="md" className="absolute -top-3 left-1/2 -translate-x-1/2">
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

      {/* Calculator */}
      <Section className="bg-ink-50 dark:bg-white/[.02]">
        <Container size="narrow">
          <SectionHeading
            eyebrow="Estimate"
            title="What would you actually keep?"
            description="Drag the sliders to see your payout under each plan. Processor fees are billed separately by the payment provider."
            align="center"
          />

          <div className="surface p-7 sm:p-9">
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <label htmlFor="volume" className="label">
                  Tickets sold: <span className="text-brand-600 dark:text-brand-400">{volume.toLocaleString()}</span>
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

              <div>
                <label htmlFor="price" className="label">
                  Ticket price: <span className="text-brand-600 dark:text-brand-400">{formatCurrency(price)}</span>
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

            <div className="mt-8 rounded-2xl bg-ink-50 p-5 dark:bg-white/[.04]">
              <div className="mb-4 flex items-baseline justify-between">
                <span className="text-sm text-ink-500 dark:text-ink-400">Gross ticket sales</span>
                <span className="text-2xl font-extrabold">{formatCurrency(gross)}</span>
              </div>

              <div className="space-y-3">
                {PLANS.map((plan) => {
                  const commission = (gross * plan.commission) / 100
                  return (
                    <div key={plan.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-200/70 pt-3 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{plan.name}</span>
                        {plan.popular && (
                          <Badge tone="brand" size="sm">
                            Popular
                          </Badge>
                        )}
                        <span className="text-xs text-ink-400">
                          −{formatCurrency(commission)} commission
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
          <SectionHeading eyebrow="Pricing questions" title="Before you commit" align="center" />
          <Accordion items={FAQ} defaultOpen={[0]} />

          <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-brand-600 to-ink-950 p-9 text-center text-white">
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
