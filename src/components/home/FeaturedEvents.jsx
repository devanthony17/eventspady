import { useState } from 'react'
import { ArrowRight, Flame, Sparkles, Ticket, Video } from 'lucide-react'
import { Container, Section, SectionHeading } from '@components/ui/Section'
import { Button } from '@components/ui/Button'
import { Tabs } from '@components/ui/Tabs'
import { EventCard } from '@components/events/EventCard'
import { events, featuredEvents, freeEvents, onlineEvents, trendingEvents } from '@data/events'

const TABS = [
  { id: 'featured', label: 'Featured', icon: Sparkles },
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'online', label: 'Online', icon: Video },
  { id: 'free', label: 'Free', icon: Ticket },
]

const SOURCES = {
  featured: featuredEvents,
  trending: trendingEvents,
  online: onlineEvents,
  free: freeEvents,
}

export function FeaturedEvents() {
  const [tab, setTab] = useState('featured')
  const list = (SOURCES[tab] ?? (() => events))().slice(0, 6)

  return (
    <Section className="bg-ink-50 dark:bg-white/[.02]">
      <Container>
        <SectionHeading
          eyebrow="Handpicked"
          title="Events worth clearing your calendar for"
          description="Curated by our team and ranked by what people are actually booking this week."
          action={
            <Button to="/events" variant="outline" iconRight={ArrowRight}>
              View all events
            </Button>
          }
        />

        <Tabs
          tabs={TABS.map((t) => ({ ...t, count: (SOURCES[t.id] ?? (() => events))().length }))}
          active={tab}
          onChange={setTab}
          variant="pill"
          className="mb-8 w-full sm:w-auto sm:self-start"
        />

        {list.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-500">Nothing in this list right now.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((event) => (
              <EventCard key={event.id} event={event} className="animate-fade-up" />
            ))}
          </div>
        )}
      </Container>
    </Section>
  )
}
