import { useEffect, useMemo, useRef, useState } from 'react'
import { Container } from '@components/ui/Section'
import { useLandingCms, useEvents, useOrganizers } from '@hooks/api'
import { useStore } from '@context/StoreContext'
import { formatCompact } from '@lib/utils'
import { usePrefersReducedMotion } from '@hooks/useMediaQuery'

/** Counts up once the strip scrolls into view. Static if motion is reduced. */
function useCountUp(target, run) {
  const reduced = usePrefersReducedMotion()
  const [value, setValue] = useState(reduced ? target : 0)

  useEffect(() => {
    if (!run || reduced) {
      setValue(target)
      return
    }

    const duration = 1400
    const start = performance.now()
    let frame

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration)
      // ease-out-cubic
      setValue(Math.round(target * (1 - (1 - progress) ** 3)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, run, reduced])

  return value
}

function Stat({ item, run }) {
  const value = useCountUp(item.value, run)

  return (
    <div className="text-center">
      <p className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem]">
        {formatCompact(value)}
        {item.suffix}
      </p>
      <p className="mt-1.5 text-sm font-medium text-ink-500 dark:text-ink-400">{item.label}</p>
    </div>
  )
}

export function StatsStrip() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const { data: cmsData } = useLandingCms()
  const { events: storeEvents = [], orders: storeOrders = [], organizers: storeOrganizers = [], cms: storeCms } = useStore()
  const { data: eventsData } = useEvents()
  const { data: organizersData } = useOrganizers()

  const liveEvents = useMemo(() => {
    if (Array.isArray(eventsData)) return eventsData
    return eventsData?.events || eventsData?.data || storeEvents
  }, [eventsData, storeEvents])

  const liveOrganizers = useMemo(() => {
    if (Array.isArray(organizersData)) return organizersData
    return organizersData?.organizers || organizersData?.data || storeOrganizers
  }, [organizersData, storeOrganizers])

  const cmsStats = cmsData?.stats || cmsData?.platformStats || storeCms?.stats

  const stats = useMemo(() => {
    if (Array.isArray(cmsStats) && cmsStats.length > 0) return cmsStats

    const totalTicketsSold = storeOrders.reduce(
      (sum, o) => sum + (o.items || []).reduce((s, i) => s + (i.quantity || 0), 0) || (o.quantity || 0),
      0,
    )
    const verifiedOrgCount = liveOrganizers.filter((o) => o.status === 'verified' || o.verified).length || liveOrganizers.length

    return [
      { value: totalTicketsSold, suffix: '+', label: 'Tickets booked' },
      { value: verifiedOrgCount, suffix: '+', label: 'Verified organizers' },
      { value: liveEvents.length, suffix: '+', label: 'Live events listed' },
      { value: 99.9, suffix: '%', label: 'Gate scanner uptime' },
    ]
  }, [cmsStats, storeOrders, liveOrganizers, liveEvents])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="border-y border-ink-200/70 bg-white py-12 dark:border-white/10 dark:bg-ink-950 sm:py-14">
      <Container>
        <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((item) => (
            <Stat key={item.label} item={item} run={visible} />
          ))}
        </dl>
      </Container>
    </div>
  )
}
