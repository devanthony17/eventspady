import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, MapPin, Users } from 'lucide-react'
import { Container, Section } from '@components/ui/Section'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { useCountdown } from '@hooks/useCountdown'
import { useEvents, useLandingCms } from '@hooks/api'
import { useStore } from '@context/StoreContext'
import { formatCurrency, formatDateRange } from '@lib/utils'

function CountdownUnit({ value, label }) {
  return (
    <div className="min-w-[3.75rem] rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 text-center backdrop-blur-md">
      <span className="block text-2xl font-extrabold leading-none tabular-nums sm:text-3xl">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-white/60">{label}</span>
    </div>
  )
}

/** Countdown banner for the next big featured event. */
export function SpotlightBanner() {
  const { cms: storeCms, events: storeEvents = [] } = useStore()
  const { data: eventsData } = useEvents()
  const { data: cmsData } = useLandingCms()

  const activeEvents = useMemo(() => {
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

  const spotlightConfig = cmsData?.spotlight || cmsData?.data?.spotlight || storeCms?.spotlight

  const spotlight =
    (spotlightConfig?.eventSlug && activeEvents.find((e) => e.slug === spotlightConfig.eventSlug)) ||
    activeEvents.find((e) => e.featured && new Date(e.start || e.startDate) > new Date()) ||
    activeEvents[0]

  const countdown = useCountdown(spotlight?.start || spotlight?.startDate || new Date().toISOString())

  if (!spotlight) return null

  return (
    <Section size="tight">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-ink-950 text-white">
          <img
            src={spotlightConfig?.customImage || spotlightConfig?.image || spotlightConfig?.cover || spotlight.cover}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-40"
            loading="lazy"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/90 to-ink-950/40"
            aria-hidden="true"
          />

          <div className="relative grid gap-8 p-7 sm:p-10 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:p-12">
            <div>
              <Badge tone="glass" size="md" className="mb-4">
                {spotlightConfig?.badgeText || 'Spotlight event'}
              </Badge>

              <h2 className="text-balance text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
                {spotlight.title}
              </h2>
              <p className="mt-3 max-w-lg text-pretty text-sm text-white/70 sm:text-base">
                {spotlight.tagline}
              </p>

              <ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/75">
                <li className="flex items-center gap-2">
                  <CalendarDays className="size-4 shrink-0 text-accent-400" aria-hidden="true" />
                  {formatDateRange(spotlight.start, spotlight.end)}
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-accent-400" aria-hidden="true" />
                  {spotlight.venue ? `${spotlight.venue.name}, ${spotlight.venue.city}` : 'Online event'}
                </li>
                <li className="flex items-center gap-2">
                  <Users className="size-4 shrink-0 text-accent-400" aria-hidden="true" />
                  {spotlight.sold.toLocaleString()} going
                </li>
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button to={`/events/${spotlight.slug}`} size="lg" iconRight={ArrowRight}>
                  Get tickets from {formatCurrency(spotlight.priceFrom)}
                </Button>
                <Link
                  to="/events"
                  className="text-sm font-semibold text-white/70 underline-offset-4 transition hover:text-white hover:underline"
                >
                  Browse other events
                </Link>
              </div>
            </div>

            <div className="lg:justify-self-end">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">
                {countdown ? 'Doors open in' : 'This event has started'}
              </p>
              {countdown ? (
                <div className="flex flex-wrap gap-2.5">
                  <CountdownUnit value={countdown.days} label="Days" />
                  <CountdownUnit value={countdown.hours} label="Hours" />
                  <CountdownUnit value={countdown.minutes} label="Mins" />
                  <CountdownUnit value={countdown.seconds} label="Secs" />
                </div>
              ) : (
                <p className="text-lg font-bold">Happening now</p>
              )}

              <p className="mt-4 text-sm text-white/60">
                <span className="font-bold text-white">{spotlight.remaining.toLocaleString()}</span> tickets
                still available
              </p>

              <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-500"
                  style={{ width: `${Math.round((spotlight.sold / spotlight.capacity) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
