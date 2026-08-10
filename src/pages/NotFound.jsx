import { Link } from 'react-router-dom'
import { ArrowLeft, CalendarSearch, Home as HomeIcon, LifeBuoy } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { Container, Section } from '@components/ui/Section'
import { Button } from '@components/ui/Button'
import { EventCard } from '@components/events/EventCard'
import { upcomingEvents } from '@data/events'

export default function NotFound() {
  const suggestions = upcomingEvents().slice(0, 3)

  return (
    <>
      <Seo title="Page not found" noIndex />

      <Section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-brand-50 to-transparent dark:from-brand-950/40"
          aria-hidden="true"
        />

        <Container className="relative">
          <div className="mx-auto max-w-2xl text-center">
            <p className="bg-gradient-to-br from-brand-500 to-accent-500 bg-clip-text text-[7rem] font-extrabold leading-none text-transparent sm:text-[10rem]">
              404
            </p>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">This page has left the venue</h1>
            <p className="mt-4 text-pretty text-base text-ink-500 dark:text-ink-300">
              The link may be out of date, or the event may have been unpublished. Here are a few places worth
              trying instead.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button to="/" size="lg" iconLeft={HomeIcon}>
                Back home
              </Button>
              <Button to="/events" size="lg" variant="outline" iconLeft={CalendarSearch}>
                Browse events
              </Button>
              <Button to="/contact" size="lg" variant="ghost" iconLeft={LifeBuoy}>
                Contact support
              </Button>
            </div>
          </div>

          <div className="mt-16">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Coming up soon</h2>
              <Link
                to="/events"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
              >
                <ArrowLeft className="size-4 rotate-180" aria-hidden="true" />
                All events
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
