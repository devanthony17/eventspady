import { useMemo } from 'react'
import { ArrowRight, LocateFixed, MapPin } from 'lucide-react'
import { Container, Section, SectionHeading } from '@components/ui/Section'
import { Button } from '@components/ui/Button'
import { EventCard } from '@components/events/EventCard'
import { useGeolocation } from '@hooks/useGeolocation'
import { useEvents } from '@hooks/api'
import { useStore } from '@context/StoreContext'
import { distanceKm, getEventCoordinates } from '@lib/utils'

/**
 * Sorts venue events by distance once the visitor grants location or selects a city.
 * Falls back to the soonest upcoming events until then.
 */
export function NearbyEvents() {
  const { events: storeEvents = [] } = useStore()
  const { data: eventsData } = useEvents()
  const events = useMemo(() => {
    const apiList = Array.isArray(eventsData)
      ? eventsData
      : eventsData?.events || eventsData?.data || []
    if (apiList.length > 0) {
      const apiIds = new Set(apiList.map((e) => e.id))
      const extraStore = (storeEvents || []).filter((e) => !apiIds.has(e.id))
      return [...apiList, ...extraStore]
    }
    return storeEvents || []
  }, [eventsData, storeEvents])
  const { position, locationName, status, error, request, openModal, clearLocation } = useGeolocation()

  const list = useMemo(() => {
    const venueEvents = events.filter((e) => e.venue)

    if (!position) {
      return [...venueEvents].sort((a, b) => new Date(a.start) - new Date(b.start)).slice(0, 3)
    }

    return venueEvents
      .map((event) => {
        const coords = getEventCoordinates(event)
        const km = distanceKm(position, coords)
        return { event, km }
      })
      .filter((item) => item.km != null)
      .sort((a, b) => a.km - b.km)
      .slice(0, 3)
      .map(({ event, km }) => ({ ...event, distanceKm: km }))
  }, [events, position])

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Near you"
          title={position ? `Closest to ${locationName || 'you'} right now` : 'Happening near you'}
          description={
            position
              ? `Sorted by distance from ${locationName || 'your current position'}.`
              : 'Share your location or pick a city to rank events by how close they are to you.'
          }
          action={
            position ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="ghost" size="sm" onClick={openModal}>
                  Change
                </Button>
                <Button to="/events?near=me" variant="outline" iconRight={ArrowRight}>
                  See all nearby
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={request}
                  variant="outline"
                  iconLeft={LocateFixed}
                  loading={status === 'pending'}
                >
                  Use my location
                </Button>
                <Button variant="ghost" size="sm" onClick={openModal}>
                  Choose city
                </Button>
              </div>
            )
          }
        />

        {error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            <p>
              {error} <span>Showing upcoming events or you can select a city manually.</span>
            </p>
            <Button size="sm" variant="outline" onClick={openModal} className="h-8 text-xs">
              Select City
            </Button>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
