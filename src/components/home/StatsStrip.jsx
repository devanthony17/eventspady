import { useEffect, useMemo, useRef, useState } from 'react'
import { Container } from '@components/ui/Section'
import { useLandingCms } from '@hooks/api'
import { formatCompact } from '@lib/utils'
import { usePrefersReducedMotion } from '@hooks/useMediaQuery'

const DEFAULT_STATS = [
  { value: 24000, suffix: '+', label: 'Tickets booked' },
  { value: 180, suffix: '+', label: 'Verified organizers' },
  { value: 99, suffix: '%', label: 'Scanner uptime' },
  { value: 380, suffix: 'k GHS', label: 'Disbursed to partners' },
]

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

  const stats = useMemo(() => {
    if (Array.isArray(cmsData?.stats) && cmsData.stats.length > 0) return cmsData.stats
    if (Array.isArray(cmsData?.platformStats) && cmsData.platformStats.length > 0) return cmsData.platformStats
    return DEFAULT_STATS
  }, [cmsData])

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
