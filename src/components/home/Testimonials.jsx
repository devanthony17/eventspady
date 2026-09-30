import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Quote, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react'
import { Container, Section, SectionHeading } from '@components/ui/Section'
import { Rating } from '@components/ui/Rating'
import { useLandingCms } from '@hooks/api'
import { trustedOrganizers as defaultTrustedOrganizers } from '@data/testimonials'

const DEFAULT_TESTIMONIALS = [
  {
    id: 'test-1',
    name: 'Hajia Mariama',
    role: 'Founder, Savannah Women in Tech',
    quote: 'Eventspady transformed our conference ticketing in Wa. MoMo checkouts were instant and door check-in was seamless.',
    avatar: '/images/avatars/avatar-4.svg',
    rating: 5,
  },
  {
    id: 'test-2',
    name: 'Naa Fuseini Pelpuo IV',
    role: 'Wa Naa Cultural Affairs',
    quote: 'Moving the Dumba Festival tickets to digital QR codes eliminated gate bottlenecks completely.',
    avatar: '/images/avatars/avatar-1.svg',
    rating: 5,
  },
  {
    id: 'test-3',
    name: 'Cynthia Boakye',
    role: 'Event Producer, Royal Cosy Hills',
    quote: 'Real-time sales tracking and automatic MoMo disbursements give us complete financial transparency.',
    avatar: '/images/avatars/avatar-3.svg',
    rating: 5,
  },
]

const DEFAULT_ORGANIZERS = [
  { name: 'Wa Naa Palace Cultural Heritage', city: 'Wa', count: 14 },
  { name: 'Royal Cosy Hills (Jirapa Dubai)', city: 'Jirapa', count: 28 },
  { name: 'Savannah Tech Hub', city: 'Wa', count: 9 },
  { name: 'Upper West Music Awards (UWMAs)', city: 'Wa', count: 6 },
  { name: 'Nandom Heritage Crafts & Tourism', city: 'Nandom', count: 11 },
  { name: 'Dumba Festival Planning Committee', city: 'Wa', count: 8 },
]

export function Testimonials() {
  const { data: cmsData } = useLandingCms()
  const cmsTestimonials = cmsData?.testimonials || cmsData?.data?.testimonials
  const list = cmsTestimonials && cmsTestimonials.length > 0 ? cmsTestimonials : DEFAULT_TESTIMONIALS

  const trustedOrganizers = useMemo(() => {
    const fromCms = cmsData?.trustedOrganizers || cmsData?.data?.trustedOrganizers
    if (Array.isArray(fromCms) && fromCms.length > 0) {
      return fromCms.map((org, i) => ({
        ...org,
        logo: org.logo || defaultTrustedOrganizers[i % defaultTrustedOrganizers.length]?.logo,
      }))
    }
    return defaultTrustedOrganizers
  }, [cmsData])

  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const touchStartX = useRef(null)
  const touchEndX = useRef(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % list.length)
  }, [list.length])

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + list.length) % list.length)
  }, [list.length])

  // Infinite sliding from right to left every 5 seconds
  useEffect(() => {
    if (isPaused || list.length <= 1) return
    const timer = setInterval(() => {
      handleNext()
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused, list.length, handleNext])

  // Touch swipe handling
  const onTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const onTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const diff = touchStartX.current - touchEndX.current
    if (diff > 50) handleNext()
    else if (diff < -50) handlePrev()
    touchStartX.current = null
    touchEndX.current = null
  }

  // Calculate circular offset distance for smooth slide positioning
  const getOffset = (index, current, total) => {
    let diff = index - current
    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total
    return diff
  }

  return (
    <Section className="bg-ink-50/70 overflow-hidden dark:bg-white/[.02]">
      <Container>
        <SectionHeading
          eyebrow="Loved by organizers & attendees"
          title="Trusted for events of every size"
          description="From palace cultural festivals to university innovation summits — here is what our community says."
          align="center"
        />

        {/* 3-Card Sleek Sliding Stage */}
        <div
          className="relative mx-auto mt-10 h-[400px] sm:h-[370px] md:h-[350px] w-full max-w-6xl overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {list.map((item, index) => {
            const diff = getOffset(index, activeIndex, list.length)

            let translateX = 0
            let scale = 1
            let opacity = 1
            let blur = 'blur(0px)'
            let zIndex = 20
            let pointerEvents = 'auto'
            let isVisible = true

            if (diff === 0) {
              // Center / Middle card in sharp focus
              translateX = 0
              scale = 1
              opacity = 1
              blur = 'blur(0px)'
              zIndex = 25
              pointerEvents = 'auto'
            } else if (diff === 1) {
              // Right card (blurred)
              translateX = isMobile ? 104 : 96
              scale = isMobile ? 0.9 : 0.88
              opacity = 0.38
              blur = 'blur(3px)'
              zIndex = 10
              pointerEvents = 'auto'
            } else if (diff === -1) {
              // Left card (blurred)
              translateX = isMobile ? -104 : -96
              scale = isMobile ? 0.9 : 0.88
              opacity = 0.38
              blur = 'blur(3px)'
              zIndex = 10
              pointerEvents = 'auto'
            } else {
              // Offstage items: hidden cleanly to prevent cross-viewport transit during circular wraps
              translateX = diff > 0 ? 200 : -200
              scale = 0.75
              opacity = 0
              blur = 'blur(6px)'
              zIndex = 1
              pointerEvents = 'none'
              isVisible = false
            }

            const isCenter = diff === 0

            return (
              <figure
                key={item.id}
                onClick={() => {
                  if (diff === 1) handleNext()
                  if (diff === -1) handlePrev()
                }}
                style={{
                  transform: `translateX(calc(-50% + ${translateX}%)) scale(${scale})`,
                  opacity,
                  filter: blur,
                  zIndex,
                  pointerEvents,
                  visibility: isVisible ? 'visible' : 'hidden',
                  transition: isVisible
                    ? 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 600ms ease, filter 600ms ease'
                    : 'none',
                }}
                className={`absolute left-1/2 top-0 bottom-0 my-auto flex h-full w-[92%] sm:w-[520px] md:w-[560px] flex-col justify-between rounded-3xl p-6 sm:p-8 select-none transition-shadow ${
                  isCenter
                    ? 'border-2 border-brand-500/30 bg-white shadow-2xl ring-4 ring-brand-500/10 dark:border-brand-400/30 dark:bg-ink-900 dark:ring-brand-400/10'
                    : 'cursor-pointer border border-ink-200/60 bg-white/60 shadow-sm dark:border-white/5 dark:bg-ink-900/50 hover:opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
                      <Quote className="size-7" aria-hidden="true" />
                      {isCenter && (
                        <span className="flex items-center gap-1 rounded-full bg-brand-500/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-700 dark:text-brand-300">
                          <ShieldCheck className="size-3" />
                          Verified Community Review
                        </span>
                      )}
                    </div>
                    <Rating value={item.rating} size="sm" showValue={false} />
                  </div>

                  <blockquote className="mt-4 text-pretty text-sm sm:text-base font-medium leading-relaxed text-ink-800 dark:text-ink-100 line-clamp-4 sm:line-clamp-none">
                    “{item.quote}”
                  </blockquote>
                </div>

                <figcaption className="mt-5 flex items-center gap-3.5 border-t border-ink-200/70 pt-4 dark:border-white/10">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className={`size-12 rounded-full object-cover shadow-sm ${
                      isCenter
                        ? 'ring-2 ring-brand-500/50 shadow-md'
                        : 'ring-1 ring-ink-200 dark:ring-white/10'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm sm:text-base font-bold text-ink-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="truncate text-xs text-ink-500 dark:text-ink-400">
                      {item.role}
                    </p>
                  </div>
                </figcaption>
              </figure>
            )
          })}
        </div>

        {/* Carousel Navigation Controls & Indicator Dots */}
        <div className="mt-6 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous testimonial"
            className="grid size-9 place-items-center rounded-full border border-ink-200/80 bg-white text-ink-600 shadow-sm transition hover:scale-105 hover:bg-ink-50 hover:text-brand-600 dark:border-white/10 dark:bg-ink-900 dark:text-ink-300 dark:hover:bg-ink-800"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="flex items-center gap-2">
            {list.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to testimonial ${idx + 1}`}
                className={`h-2 transition-all duration-500 rounded-full ${
                  idx === activeIndex
                    ? 'w-7 bg-brand-500 shadow-sm'
                    : 'w-2 bg-ink-200 hover:bg-ink-300 dark:bg-white/20 dark:hover:bg-white/30'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next testimonial"
            className="grid size-9 place-items-center rounded-full border border-ink-200/80 bg-white text-ink-600 shadow-sm transition hover:scale-105 hover:bg-ink-50 hover:text-brand-600 dark:border-white/10 dark:bg-ink-900 dark:text-ink-300 dark:hover:bg-ink-800"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Sleek Organizer Logo Marquee */}
        <div className="mt-16 sm:mt-20 border-t border-ink-200/60 pt-12 dark:border-white/10">
          <div className="text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-ink-200/80 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-ink-700 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-ink-900/80 dark:text-ink-200">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Trusted by 640+ organizers, cultural palaces & institutions
            </p>
          </div>

          <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]">
            <div className="flex w-max animate-marquee items-center gap-6 sm:gap-8 hover:[animation-play-state:paused] py-3">
              {[...trustedOrganizers, ...trustedOrganizers].map((org, i) => (
                <div
                  key={`${org.id || org.name}-${i}`}
                  className="group relative flex h-14 sm:h-16 shrink-0 items-center justify-center rounded-2xl border border-ink-200/70 bg-white/90 px-6 sm:px-7 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-500/50 hover:bg-white hover:shadow-md dark:border-white/15 dark:bg-white/[.07] dark:hover:border-brand-400/60 dark:hover:bg-white/[.12]"
                  title={`${org.name}${org.tag ? ` — ${org.tag}` : ''}`}
                >
                  <img
                    src={org.logo}
                    alt={org.name}
                    loading="lazy"
                    className="h-8 sm:h-9 w-auto max-w-[160px] sm:max-w-[190px] object-contain transition-all duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/images/organizers/logo-arts-council.svg'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
