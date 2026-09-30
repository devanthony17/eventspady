import { ArrowRight, Check } from 'lucide-react'
import { Container, Section } from '@components/ui/Section'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'

const BENEFITS = [
  'Free to list — you only pay commission on tickets you sell',
  'Direct Mobile Money payments (MTN MoMo & Telecel Cash)',
  'Offline-capable QR ticket scanner for fast, smooth check-in',
  'Real-time sales analytics and automated revenue payouts',
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
              <Button to="/organizer" size="lg" iconRight={ArrowRight}>
                Create your event
              </Button>
              <Button to="/pricing" size="lg" variant="outline">
                See commission rates
              </Button>
            </div>
          </div>

          {/* Showcase right side - clean, lightweight animated display */}
          <div className="relative group">
            <div className="relative mx-auto max-w-lg overflow-hidden rounded-[2rem] border border-ink-200/80 bg-ink-950 p-2 shadow-2xl ring-1 ring-ink-950/5 dark:border-white/10 dark:ring-white/10">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.6rem] bg-ink-900">
                <img
                  src="/videos/hero2.webp"
                  alt="Eventspady Event Experience"
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
