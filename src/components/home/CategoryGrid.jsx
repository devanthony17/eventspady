import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Container, Section, SectionHeading } from '@components/ui/Section'
import { Button } from '@components/ui/Button'
import { useCategories, useEvents } from '@hooks/api'
import { cn } from '@lib/utils'

export function CategoryGrid() {
  const { data: eventsData } = useEvents()
  const { data: categoriesData } = useCategories()

  const events = useMemo(() => {
    if (Array.isArray(eventsData)) return eventsData
    return eventsData?.events || eventsData?.data || []
  }, [eventsData])

  const categories = useMemo(() => {
    if (Array.isArray(categoriesData)) return categoriesData
    return categoriesData?.categories || categoriesData?.data || []
  }, [categoriesData])

  // Compute accurate event count dynamically for each category
  const categoriesWithCounts = useMemo(() => {
    return categories.map((category) => {
      const liveCount = (events || []).filter(
        (e) => e.category === category.id || e.category?.id === category.id,
      ).length
      return {
        ...category,
        count: liveCount,
      }
    })
  }, [categories, events])

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Browse by interest"
          title="Explore events by category"
          description="From live music festivals to tech summits — pick an interest and discover what is happening."
          action={
            <Button to="/events" variant="outline" iconRight={ArrowRight}>
              All events
            </Button>
          }
        />

        {/* Circular Category Grid matching user reference image */}
        <div className="flex flex-wrap items-start justify-center gap-y-9 gap-x-4 sm:gap-x-6 md:gap-x-8 lg:gap-x-9.5 max-w-7xl mx-auto pt-2">
          {categoriesWithCounts.map((category) => (
            <Link
              key={category.id}
              to={`/events?category=${category.id}`}
              className="group flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-full w-24 sm:w-28 md:w-30"
            >
              {/* Circular Icon Pod */}
              <div
                className={cn(
                  'relative flex size-20 sm:size-24 md:size-26 items-center justify-center rounded-full',
                  'border border-[#dce6fa] bg-white shadow-xs',
                  'transition-all duration-300 ease-out',
                  'group-hover:border-blue-400 group-hover:shadow-md group-hover:scale-105',
                  'dark:border-blue-400/25 dark:bg-ink-900/80 dark:group-hover:border-blue-400 dark:group-hover:bg-ink-800',
                )}
              >
                {/* Subtle soft hover glow */}
                <span
                  className="absolute inset-0 rounded-full bg-blue-50/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-blue-500/10"
                  aria-hidden="true"
                />

                {/* Minimalist Line-Art Icon */}
                <category.icon
                  className="relative z-10 size-9 sm:size-10 md:size-11 text-[#2d2942] transition-colors duration-300 group-hover:text-brand-600 dark:text-ink-100 dark:group-hover:text-brand-400"
                />
              </div>

              {/* Category Title below circle */}
              <span className="mt-3 block text-xs sm:text-sm font-bold tracking-tight text-ink-900 transition-colors duration-300 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400 max-w-[110px] text-center leading-snug">
                {category.name}
              </span>

              {/* Accurate dynamic event count */}
              <span className="mt-0.5 text-[11px] font-semibold text-ink-400 transition-colors duration-300 group-hover:text-brand-500 dark:text-ink-400 dark:group-hover:text-brand-300">
                {category.count} {category.count === 1 ? 'event' : 'events'}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  )
}
