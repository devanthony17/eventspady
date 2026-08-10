import { ArrowRight, Globe2, Heart, Lightbulb, ShieldCheck, Users } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { PageHero } from '@components/layout/PageHero'
import { Container, Section, SectionHeading } from '@components/ui/Section'
import { Button } from '@components/ui/Button'
import { Avatar } from '@components/ui/Avatar'
import { StatsStrip } from '@components/home/StatsStrip'
import { Testimonials } from '@components/home/Testimonials'

const VALUES = [
  {
    icon: Heart,
    title: 'The event comes first',
    description:
      'Every decision starts with whether it helps an organizer run a better night, not whether it adds a line to a feature list.',
  },
  {
    icon: ShieldCheck,
    title: 'Boring where it counts',
    description:
      'Payments, tickets and check-in should be predictable. We save the creativity for the parts that are not holding your money.',
  },
  {
    icon: Globe2,
    title: 'Built for everywhere',
    description:
      'Mobile money in Lagos matters as much as cards in Berlin. Multi-language, multi-currency and multi-channel by default.',
  },
  {
    icon: Lightbulb,
    title: 'Honest by design',
    description:
      'Commission, taxes and fees are itemised on every order. No surprises for the organizer or the attendee.',
  },
]

const TEAM = [
  { name: 'Amara Diallo', role: 'Head of Organizer Success', avatar: '/images/avatars/avatar-1.svg' },
  { name: 'Tomas Lindqvist', role: 'Product', avatar: '/images/avatars/avatar-2.svg' },
  { name: 'Priya Raman', role: 'Community', avatar: '/images/avatars/avatar-3.svg' },
  { name: 'Daniel Okoro', role: 'Payments', avatar: '/images/avatars/avatar-4.svg' },
  { name: 'Lena Fischer', role: 'Engineering', avatar: '/images/avatars/avatar-12.svg' },
  { name: 'Marco Silva', role: 'Design', avatar: '/images/avatars/avatar-9.svg' },
]

const TIMELINE = [
  { year: '2016', title: 'A spreadsheet and a door', description: 'We started by running our own club nights and hating every part of the ticketing.' },
  { year: '2018', title: 'First 1,000 organizers', description: 'The scanner app shipped and door queues stopped being the worst part of the night.' },
  { year: '2021', title: 'Payments everywhere', description: 'Flutterwave and Razorpay joined Stripe and PayPal, opening up two more continents.' },
  { year: '2023', title: 'Multi-language platform', description: 'Admins could translate the whole product, panels included, without touching code.' },
  { year: 'Today', title: '2.4M tickets and counting', description: '48,000 events across 74 countries, from supper clubs to arena finals.' },
]

export default function About() {
  return (
    <>
      <Seo
        title="About us"
        description="Eventspady is the event booking and management platform built by people who used to run the door themselves. 2.4 million tickets across 74 countries."
        keywords="about eventspady, event ticketing company, event management platform"
      />

      <PageHero
        tone="dark"
        eyebrow="About Eventspady"
        title="We build the boring parts so your event can be the interesting one"
        description="Ticketing, payments, guest lists and check-in — handled, so you can spend your energy on the thing people actually came for."
        breadcrumbs={[{ label: 'About' }]}
      >
        <div className="flex flex-wrap gap-3">
          <Button to="/organizer" size="lg" iconRight={ArrowRight}>
            Start organizing
          </Button>
          <Button
            to="/events"
            size="lg"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/15 hover:text-white"
          >
            Browse events
          </Button>
        </div>
      </PageHero>

      <StatsStrip />

      {/* Story */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Our story"
                title="It started because we were the ones on the door"
                className="mb-6"
              />
              <div className="space-y-4 text-pretty leading-relaxed text-ink-600 dark:text-ink-300">
                <p>
                  Eventspady began in 2016 with a warehouse night, a printed guest list and a queue that went
                  around the block because nobody could find their name. The event was good. The operation was not.
                </p>
                <p>
                  We built the first version of the scanner that weekend. It was ugly and it worked, and the
                  next event's queue cleared in twenty minutes. Everything since has been an extension of that
                  same idea — remove the friction between wanting to be at an event and actually being inside it.
                </p>
                <p>
                  Today organizers in 74 countries use Eventspady to sell tickets, take payment in the way their
                  audience actually pays, and get people through the door without anyone reaching for a
                  spreadsheet.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img src="/images/gallery/gallery-1.svg" alt="" loading="lazy" className="mt-8 aspect-[3/4] w-full rounded-3xl object-cover" />
              <img src="/images/gallery/gallery-2.svg" alt="" loading="lazy" className="aspect-[3/4] w-full rounded-3xl object-cover" />
              <img src="/images/gallery/gallery-3.svg" alt="" loading="lazy" className="col-span-2 aspect-[16/9] w-full rounded-3xl object-cover" />
            </div>
          </div>
        </Container>
      </Section>

      {/* Values */}
      <Section className="bg-ink-50 dark:bg-white/[.02]">
        <Container>
          <SectionHeading
            eyebrow="What we believe"
            title="Four things we will not compromise on"
            align="center"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            {VALUES.map((value) => (
              <article key={value.title} className="surface p-6">
                <span className="mb-4 grid size-11 place-items-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                  <value.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold">{value.title}</h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-500 dark:text-ink-400">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* Timeline */}
      <Section>
        <Container size="narrow">
          <SectionHeading eyebrow="Milestones" title="How we got here" align="center" />

          <ol className="relative border-l border-ink-200 pl-8 dark:border-white/10">
            {TIMELINE.map((item) => (
              <li key={item.year} className="relative pb-10 last:pb-0">
                <span className="absolute -left-[2.4rem] grid size-6 place-items-center rounded-full bg-brand-600 ring-4 ring-white dark:ring-ink-950">
                  <span className="size-2 rounded-full bg-white" />
                </span>
                <p className="text-sm font-extrabold text-brand-600 dark:text-brand-400">{item.year}</p>
                <h3 className="mt-1 text-lg font-bold">{item.title}</h3>
                <p className="mt-1.5 text-pretty text-sm text-ink-500 dark:text-ink-400">{item.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* Team */}
      <Section className="bg-ink-50 dark:bg-white/[.02]">
        <Container>
          <SectionHeading
            eyebrow="The team"
            title="Small team, a lot of events"
            description="We are spread across four countries and most of us still work a door somewhere every few months."
            align="center"
          />

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {TEAM.map((person) => (
              <div key={person.name} className="text-center">
                <Avatar src={person.avatar} name={person.name} size="2xl" className="mx-auto" />
                <p className="mt-3 text-sm font-bold">{person.name}</p>
                <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">{person.role}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              <Users className="size-6" aria-hidden="true" />
            </span>
            <h3 className="text-xl font-bold">We are hiring</h3>
            <p className="max-w-md text-sm text-ink-500 dark:text-ink-400">
              Engineering, support and partnerships. If you have run events yourself, tell us about it.
            </p>
            <Button to="/contact" variant="outline">
              Get in touch
            </Button>
          </div>
        </Container>
      </Section>

      <Testimonials />
    </>
  )
}
