import { useRef, useState, useEffect } from 'react'
import { ArrowRight, CheckCircle2, Globe2, Heart, Lightbulb, ShieldCheck } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { PageHero } from '@components/layout/PageHero'
import { Container, Section, SectionHeading } from '@components/ui/Section'
import { Button } from '@components/ui/Button'
import { StatsStrip } from '@components/home/StatsStrip'
import { Testimonials } from '@components/home/Testimonials'
import { useAos } from '@hooks/useAos'

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
      'A trader paying by MoMo in Wa matters as much as a card payment anywhere else. Multi-language, mobile-money-first and built for the connection speeds people actually have.',
  },
  {
    icon: Lightbulb,
    title: 'Honest by design',
    description:
      'Commission, taxes and fees are itemised on every order. No surprises for the organizer or the attendee.',
  },
]

const TIMELINE = [
  {
    year: '2016',
    title: 'A spreadsheet and a door',
    description: 'We started by running our own nights in Wa and hating every part of the ticketing.',
    badge: 'Humble Origins',
  },
  {
    year: '2018',
    title: 'First 200 organizers',
    description: 'The scanner app shipped and door queues stopped being the worst part of the night.',
    badge: 'Mobile Scanner V1',
  },
  {
    year: '2021',
    title: 'Mobile money first',
    description: 'MTN MoMo and Telecel Cash went live at checkout, and advance ticket sales across the region doubled within a season.',
    badge: 'Instant Settlements',
  },
  {
    year: '2023',
    title: 'Dagaare and Waali',
    description: 'Admins could translate the whole product, panels included, without touching code.',
    badge: 'Indigenous Languages',
  },
  {
    year: 'Today',
    title: '186K tickets and counting',
    description: '3,400 events across all eleven districts of the Upper West, from courtyard dinners to the Dumba festival.',
    badge: 'Regional Leader',
  },
]

/**
 * Animated Milestone Timeline with dynamic scroll-driven progress line.
 * Automatically animates down as you scroll forward and retracts up as you scroll back.
 */
function MilestoneTimeline({ items }) {
  const containerRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!containerRef.current) return
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) return
          const rect = containerRef.current.getBoundingClientRect()
          const viewportHeight = window.innerHeight

          // Start drawing as the container top enters 75% down the viewport
          const triggerStart = viewportHeight * 0.75
          // Reach 100% when bottom of container reaches 35% of the viewport
          const triggerEnd = viewportHeight * 0.35

          const totalDistance = rect.height
          const scrolledDistance = triggerStart - rect.top
          const rawProgress = scrolledDistance / (totalDistance + (triggerStart - triggerEnd) * 0.5)
          const clamped = Math.min(Math.max(rawProgress, 0), 1)

          setScrollProgress(clamped)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative mx-auto max-w-3xl">
      {/* Background static line track */}
      <div
        className="absolute left-[19px] sm:left-[23px] top-6 bottom-6 w-1 rounded-full bg-ink-200/80 dark:bg-white/10"
        aria-hidden="true"
      />

      {/* Dynamic animated timeline line that fills down and retracts up with scroll in blue tone */}
      <div
        className="absolute left-[19px] sm:left-[23px] top-6 w-1 rounded-full bg-gradient-to-b from-brand-700 via-brand-500 to-sky-400 shadow-[0_0_16px_rgba(74,97,182,0.85)] dark:from-brand-600 dark:via-brand-400 dark:to-sky-300 dark:shadow-[0_0_20px_rgba(99,102,241,0.9)] transition-[height] duration-75 ease-out"
        style={{ height: `${scrollProgress * 100}%` }}
        aria-hidden="true"
      >
        {/* Animated glowing beacon at the leading tip of the line in matching blue tone */}
        <div
          className="absolute -bottom-2.5 -left-[6px] size-4 rounded-full bg-brand-500 shadow-[0_0_16px_rgba(74,97,182,1)] ring-2 ring-white dark:ring-ink-950 transition-opacity duration-200 flex items-center justify-center dark:bg-sky-400"
          style={{ opacity: scrollProgress > 0.02 ? 1 : 0 }}
        >
          <span className="size-2 rounded-full bg-white animate-pulse" />
          <span className="absolute -inset-1 size-6 animate-ping rounded-full bg-brand-400 opacity-60 dark:bg-sky-300" />
        </div>
      </div>

      {/* Milestone items list */}
      <ol className="relative space-y-10 sm:space-y-12 pl-12 sm:pl-16">
        {items.map((item, idx) => {
          const itemThreshold = items.length > 1 ? idx / (items.length - 1) : 0
          const isReached = scrollProgress >= itemThreshold * 0.92

          return (
            <li
              key={item.year}
              data-aos="fade-up"
              data-aos-delay={`${idx * 100}`}
              className="relative group"
            >
              {/* Milestone node marker */}
              <span
                className={`absolute -left-[3rem] sm:-left-[3.75rem] top-1.5 grid size-7 sm:size-8 place-items-center rounded-full transition-all duration-500 ring-4 ring-white dark:ring-ink-950 ${
                  isReached
                    ? 'bg-brand-600 text-white shadow-[0_0_18px_rgba(74,97,182,0.7)] scale-110'
                    : 'bg-ink-100 text-ink-400 dark:bg-ink-900 dark:text-ink-600'
                }`}
              >
                {isReached ? (
                  <CheckCircle2 className="size-4 sm:size-4.5 text-white animate-in zoom-in-50 duration-300" />
                ) : (
                  <span className="size-2 rounded-full bg-ink-400 dark:bg-ink-600" />
                )}
              </span>

              {/* Milestone Card */}
              <div
                className={`surface p-5 sm:p-7 transition-all duration-300 group-hover:scale-[1.01] ${
                  isReached
                    ? 'border-brand-500/40 shadow-md dark:border-brand-400/30'
                    : 'hover:border-ink-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span
                    className={`inline-block text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full transition-colors ${
                      isReached
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300'
                        : 'bg-ink-100 text-ink-600 dark:bg-white/[.06] dark:text-ink-400'
                    }`}
                  >
                    {item.year}
                  </span>
                  {item.badge && (
                    <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-300">
                      {item.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-ink-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-500 dark:text-ink-400">
                  {item.description}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default function About() {
  // Initialize Animate-On-Scroll reveals across the page
  useAos({ threshold: 0.1, once: true })

  return (
    <>
      <Seo
        title="About us"
        description="Eventspady is the event booking and management platform for Wa and the Upper West Region, built by people who used to run the door themselves. 186,000 tickets across eleven districts."
        keywords="about eventspady, event ticketing company, event management platform, wa events, upper west events"
      />

      {/* Hero with authentic background image */}
      <PageHero
        tone="dark"
        bgImage="/images/about/hero.jpg"
        imageAlt="Wa Cultural Festival and celebration evening"
        eyebrow="About Eventspady"
        title="We build the boring parts so your event can be the interesting one"
        description="Ticketing, payments, guest lists and check-in — handled, so you can spend your energy on the thing people actually came for."
        breadcrumbs={[{ label: 'About' }]}
      >
        <div className="flex flex-wrap gap-3" data-aos="fade-up" data-aos-delay="200">
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

      {/* Stats Strip with AOS reveal */}
      <div data-aos="fade-up" data-aos-delay="100">
        <StatsStrip />
      </div>

      {/* Our Story with real generated photographic imagery */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div data-aos="fade-right" data-aos-delay="100">
              <SectionHeading
                eyebrow="Our story"
                title="It started because we were the ones on the door"
                className="mb-6"
              />
              <div className="space-y-4 text-pretty leading-relaxed text-ink-600 dark:text-ink-300">
                <p>
                  Eventspady began in 2016 with a night at a Wa nightclub, a printed guest list and a queue that ran
                  down Dobile Junction because nobody could find their name. The event was good. The operation was not.
                </p>
                <p>
                  We built the first version of the scanner that weekend. It was ugly and it worked, and the
                  next event’s queue cleared in twenty minutes. Everything since has been an extension of that
                  same idea — remove the friction between wanting to be at an event and actually being inside it.
                </p>
                <p>
                  Today organizers across all eleven Upper West districts use Eventspady to sell tickets, take payment in the way their
                  audience actually pays, and get people through the door without anyone reaching for a
                  spreadsheet.
                </p>
              </div>
            </div>

            {/* Generated Story Images Grid */}
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              <div
                data-aos="fade-down"
                data-aos-delay="200"
                className="group relative overflow-hidden rounded-3xl shadow-xl ring-1 ring-ink-950/10 dark:ring-white/10"
              >
                <img
                  src="/images/about/story-1.jpg"
                  alt="Young Ghanaian event organizers coordinating admissions in Wa"
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-4">
                  <p className="text-xs font-semibold text-white">Event coordination in Wa</p>
                </div>
              </div>

              <div
                data-aos="fade-up"
                data-aos-delay="300"
                className="group relative overflow-hidden rounded-3xl shadow-xl ring-1 ring-ink-950/10 dark:ring-white/10 mt-6 sm:mt-8"
              >
                <img
                  src="/images/about/story-2.jpg"
                  alt="Real-time smartphone ticket scanner check-in at Wa festival gate"
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-4">
                  <p className="text-xs font-semibold text-white">Sub-second QR gate check-in</p>
                </div>
              </div>

              <div
                data-aos="zoom-in-up"
                data-aos-delay="400"
                className="col-span-2 group relative overflow-hidden rounded-3xl shadow-xl ring-1 ring-ink-950/10 dark:ring-white/10"
              >
                <img
                  src="/images/about/story-3.jpg"
                  alt="Vibrant cultural celebration and community festival in Wa"
                  loading="lazy"
                  className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-5">
                  <p className="text-xs sm:text-sm font-semibold text-white">Traditional palace festival celebration, Wa</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Values Section */}
      <Section className="bg-ink-50 dark:bg-white/[.02]">
        <Container>
          <div data-aos="fade-up">
            <SectionHeading
              eyebrow="What we believe"
              title="Four things we will not compromise on"
              align="center"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 mt-10">
            {VALUES.map((value, idx) => (
              <article
                key={value.title}
                data-aos="fade-up"
                data-aos-delay={`${(idx + 1) * 100}`}
                className="surface p-6 sm:p-8 transition-all duration-300 hover:border-brand-500/30 hover:shadow-md"
              >
                <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-700 shadow-sm dark:bg-brand-500/15 dark:text-brand-300">
                  <value.icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="text-xl font-bold">{value.title}</h3>
                <p className="mt-2.5 text-pretty text-sm leading-relaxed text-ink-500 dark:text-ink-400">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* Milestones Section with Interactive Scroll-driven Timeline Line */}
      <Section>
        <Container size="narrow">
          <div data-aos="fade-up">
            <SectionHeading eyebrow="Milestones" title="How we got here" align="center" className="mb-12 sm:mb-16" />
          </div>

          <MilestoneTimeline items={TIMELINE} />
        </Container>
      </Section>

      {/* Testimonials with AOS reveal */}
      <div data-aos="fade-up">
        <Testimonials />
      </div>
    </>
  )
}
