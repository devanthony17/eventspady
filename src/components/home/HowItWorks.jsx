import { CalendarSearch, CreditCard, QrCode, Ticket } from 'lucide-react'
import { Container, Section, SectionHeading } from '@components/ui/Section'
import { cn } from '@lib/utils'

const STEPS = [
  {
    icon: CalendarSearch,
    title: 'Find an event',
    description:
      'Search by city, category or date, or let us sort what is happening nearby by distance from you.',
  },
  {
    icon: Ticket,
    title: 'Pick your tickets',
    description:
      'Free, paid, one-day or all-days — choose the ticket that fits and add a coupon if you have one.',
  },
  {
    icon: CreditCard,
    title: 'Pay your way',
    description:
      'MTN MoMo, Telecel Cash, card or wallet balance. Most organizers also let you pay cash at the door.',
  },
  {
    icon: QrCode,
    title: 'Scan and walk in',
    description:
      'Your QR ticket lands instantly. Show it at the door and the scanner checks you in — no printing required.',
  },
]

export function HowItWorks() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="From browsing to the front of the queue"
          description="Four steps, a couple of minutes, and you are in."
          align="center"
        />

        <ol className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* Connector rail on wide screens */}
          <span
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-ink-200 to-transparent dark:via-white/15 lg:block"
            aria-hidden="true"
          />

          {STEPS.map((step, i) => (
            <li key={step.title} className="relative text-center lg:text-left">
              <div className="mb-5 flex justify-center lg:justify-start">
                <span
                  className={cn(
                    'relative grid size-14 place-items-center rounded-2xl border border-ink-200/70 bg-white text-brand-600 shadow-soft',
                    'dark:border-white/10 dark:bg-ink-900 dark:text-brand-400',
                  )}
                >
                  <step.icon className="size-6" aria-hidden="true" />
                  <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-brand-600 text-[11px] font-extrabold text-white">
                    {i + 1}
                  </span>
                </span>
              </div>
              <h3 className="text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-500 dark:text-ink-400">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  )
}
