import { ArrowRight, BarChart3, Check, QrCode, ScanLine, Smartphone, Wallet } from 'lucide-react'
import { Container, Section } from '@components/ui/Section'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'

const BENEFITS = [
  'Free to list — you only pay commission on tickets you sell',
  'Five online payment channels plus cash at the door',
  'Offline-capable QR scanner for fast, calm check-in',
  'Coupons, taxes and payouts itemised on every order',
]

export function OrganizerCta() {
  return (
    <Section>
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Copy */}
          <div>
            <Badge tone="accent" size="md" className="mb-5">
              For organizers
            </Badge>
            <h2 className="text-balance text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.6rem]">
              Run your next event without the spreadsheet chaos
            </h2>
            <p className="mt-4 text-pretty text-base leading-relaxed text-ink-500 dark:text-ink-300">
              Create a listing in minutes, sell four kinds of ticket, manage your guest list, and check people
              in with a phone. Everything reconciles itself afterwards.
            </p>

            <ul className="mt-7 space-y-3">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span className="text-sm text-ink-600 dark:text-ink-300">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/organizer/events/new" size="lg" iconRight={ArrowRight}>
                Create your event
              </Button>
              <Button to="/pricing" size="lg" variant="outline">
                See commission rates
              </Button>
            </div>
          </div>

          {/* Scanner mockup */}
          <div className="relative">
            <div className="relative mx-auto max-w-sm">
              <div className="rounded-[2.5rem] border border-ink-200/70 bg-gradient-to-br from-brand-600 to-ink-950 p-3 shadow-lift dark:border-white/10">
                <div className="rounded-[2rem] bg-ink-950 p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ScanLine className="size-4 text-brand-300" aria-hidden="true" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white/60">Scanner</span>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      Offline ready
                    </span>
                  </div>

                  <div className="my-6 grid place-items-center">
                    <div className="relative grid size-40 place-items-center rounded-2xl border-2 border-dashed border-white/20 bg-white/5">
                      <QrCode className="size-20 text-white/85" aria-hidden="true" />
                      <span className="absolute inset-x-6 top-1/2 h-0.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,.9)]" />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-emerald-500/15 p-3 text-center">
                    <p className="text-sm font-bold text-emerald-300">Ticket valid — checked in</p>
                    <p className="mt-0.5 text-xs text-white/60">EVP-7K2M9X · All Days Pass</p>
                  </div>

                  <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
                    {[
                      { label: 'Scanned', value: '1,284' },
                      { label: 'Expected', value: '2,140' },
                      { label: 'Duplicates', value: '3' },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <dd className="text-base font-extrabold">{stat.value}</dd>
                        <dt className="text-[10px] uppercase tracking-wider text-white/45">{stat.label}</dt>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {/* Floating chips */}
              <div className="absolute -left-4 top-16 hidden rounded-2xl border border-ink-200/70 bg-white p-3 shadow-card dark:border-white/10 dark:bg-ink-900 sm:block">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <Wallet className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs text-ink-400">Payout ready</p>
                    <p className="text-sm font-extrabold">$48,210</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-20 hidden rounded-2xl border border-ink-200/70 bg-white p-3 shadow-card dark:border-white/10 dark:bg-ink-900 sm:block">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                    <BarChart3 className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs text-ink-400">Sold today</p>
                    <p className="text-sm font-extrabold">+128 tickets</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-3 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-ink-200/70 bg-white px-4 py-2 shadow-card dark:border-white/10 dark:bg-ink-900 lg:flex">
                <Smartphone className="size-4 text-brand-500" aria-hidden="true" />
                <span className="text-xs font-semibold">Scanner app for iOS & Android</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
