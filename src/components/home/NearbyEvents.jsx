import { useMemo } from 'react'
import { ArrowRight, LocateFixed, MapPin } from 'lucide-react'
import { Container, Section, SectionHeading } from '@components/ui/Section'
import { Button } from '@components/ui/Button'
import { EventCard } from '@components/events/EventCard'
import { useGeolocation } from '@hooks/useGeolocation'
import { events } from '@data/events'
import { distanceKm } from '@lib/utils'

/**
 * Sorts venue events by distance once the visitor grants location.
 * Falls back to the soonest upcoming events until then.
 */
export function NearbyEvents() {
  const { position, status, error, request } = useGeolocation()

  const list = useMemo(() => {
    const venueEvents = events.filter((e) => e.venue)

    if (!position) {
      return [...venueEvents].sort((a, b) => new Date(a.start) - new Date(b.start)).slice(0, 3)
    }

    return venueEvents
      .map((event) => ({ event, km: distanceKm(position, { lat: event.venue.lat, lng: event.venue.lng }) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 3)
      .map(({ event, km }) => ({ ...event, distanceKm: km }))
  }, [position])

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Near you"
          title={position ? 'Closest to you right now' : 'Happening near you'}
          description={
            position
              ? 'Sorted by straight-line distance from your current location.'
              : 'Share your location and we will rank events by how far you would have to travel.'
          }
          action={
            position ? (
              <Button to="/events?near=me" variant="outline" iconRight={ArrowRight}>
                See all nearby
              </Button>
            ) : (
              <Button
                onClick={request}
                variant="outline"
                iconLeft={LocateFixed}
                loading={status === 'pending'}
              >
                Use my location
              </Button>
            )
          }
        />

        {error && (
          <p className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            {error} Showing the soonest upcoming events instead.
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((event) => (
            <div key={event.id} className="relative">
              <EventCard event={event} />
              {event.distanceKm != null && (
                <span className="pointer-events-none absolute right-3 top-14 z-20 rounded-full bg-ink-950/85 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
                  <MapPin className="mr-1 inline size-3" aria-hidden="true" />
                  {event.distanceKm < 1
                    ? `${Math.round(event.distanceKm * 1000)} m away`
                    : `${event.distanceKm.toFixed(event.distanceKm < 10 ? 1 : 0)} km away`}
                </span>
              )}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
