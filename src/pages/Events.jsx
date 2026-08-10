import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarSearch, LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { Container, Section } from '@components/ui/Section'
import { Breadcrumbs } from '@components/ui/Breadcrumbs'
import { Button } from '@components/ui/Button'
import { Pagination } from '@components/ui/Pagination'
import { EmptyState } from '@components/ui/EmptyState'
import { EventCard } from '@components/events/EventCard'
import { ActiveFilterChips, EventFilters } from '@components/events/EventFilters'
import { useGeolocation } from '@hooks/useGeolocation'
import { events } from '@data/events'
import { categories } from '@data/categories'
import { cn, distanceKm } from '@lib/utils'

const PER_PAGE = 9

const SORT_OPTIONS = [
  { id: 'soonest', label: 'Soonest first' },
  { id: 'popular', label: 'Most popular' },
  { id: 'rating', label: 'Highest rated' },
  { id: 'priceLow', label: 'Price: low to high' },
  { id: 'priceHigh', label: 'Price: high to low' },
]

/** Reads the filter state out of the URL so every view is shareable. */
function readFilters(params) {
  return {
    q: params.get('q') ?? '',
    type: params.get('type') ?? '',
    city: params.get('city') ?? '',
    when: params.get('when') ?? '',
    price: params.get('price') ?? 'all',
    sort: params.get('sort') ?? 'soonest',
    near: params.get('near') === 'me',
    categories: params.get('category') ? params.get('category').split(',').filter(Boolean) : [],
    ticketTypes: params.get('ticket') ? params.get('ticket').split(',').filter(Boolean) : [],
  }
}

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function matchesWhen(event, when) {
  if (!when) return true

  const start = new Date(event.start)
  const today = startOfToday()

  if (when === 'today') {
    const tomorrow = new Date(today.getTime() + 86400000)
    return start >= today && start < tomorrow
  }

  if (when === 'weekend') {
    // Upcoming Saturday 00:00 through Monday 00:00.
    const day = today.getDay()
    const daysUntilSaturday = (6 - day + 7) % 7
    const saturday = new Date(today.getTime() + daysUntilSaturday * 86400000)
    const monday = new Date(saturday.getTime() + 2 * 86400000)
    return start >= saturday && start < monday
  }

  if (when === 'week') return start >= today && start < new Date(today.getTime() + 7 * 86400000)
  if (when === 'month') return start >= today && start < new Date(today.getTime() + 30 * 86400000)

  return true
}

function matchesPrice(event, price) {
  if (price === 'free') return event.isFree
  if (price === 'paid') return !event.isFree
  if (price === 'under50') return event.priceFrom < 50
  if (price === 'under150') return event.priceFrom < 150
  return true
}

export default function Events() {
  const [params, setParams] = useSearchParams()
  const [view, setView] = useState('grid')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [page, setPage] = useState(1)
  const { position, status: locationStatus, request: requestLocation } = useGeolocation()

  const filters = useMemo(() => readFilters(params), [params])
  const [searchInput, setSearchInput] = useState(filters.q)

  useEffect(() => setSearchInput(filters.q), [filters.q])
  useEffect(() => setPage(1), [params])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  const updateFilters = (patch) => {
    const next = { ...filters, ...patch }
    const search = new URLSearchParams()

    if (next.q) search.set('q', next.q)
    if (next.type) search.set('type', next.type)
    if (next.city) search.set('city', next.city)
    if (next.when) search.set('when', next.when)
    if (next.price && next.price !== 'all') search.set('price', next.price)
    if (next.sort && next.sort !== 'soonest') search.set('sort', next.sort)
    if (next.near) search.set('near', 'me')
    if (next.categories.length) search.set('category', next.categories.join(','))
    if (next.ticketTypes.length) search.set('ticket', next.ticketTypes.join(','))

    setParams(search, { replace: true })
  }

  const resetFilters = () => setParams(new URLSearchParams(), { replace: true })

  const onUseLocation = () => {
    if (filters.near) {
      updateFilters({ near: false })
      return
    }
    requestLocation()
    updateFilters({ near: true })
  }

  const results = useMemo(() => {
    const q = filters.q.trim().toLowerCase()

    let list = events.filter((event) => {
      if (q) {
        const haystack = [event.title, event.tagline, event.venue?.city, event.categoryMeta?.name, ...event.tags]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (filters.type && event.type !== filters.type) return false
      if (filters.city && event.venue?.city !== filters.city) return false
      if (filters.categories.length && !filters.categories.includes(event.category)) return false
      if (filters.ticketTypes.length && !event.tickets.some((t) => filters.ticketTypes.includes(t.type))) return false
      if (!matchesPrice(event, filters.price)) return false
      if (!matchesWhen(event, filters.when)) return false
      return true
    })

    if (filters.near && position) {
      list = list
        .map((event) => ({
          event,
          km: event.venue ? distanceKm(position, { lat: event.venue.lat, lng: event.venue.lng }) : Infinity,
        }))
        .sort((a, b) => a.km - b.km)
        .map(({ event }) => event)
      return list
    }

    const sorters = {
      soonest: (a, b) => new Date(a.start) - new Date(b.start),
      popular: (a, b) => b.sold - a.sold,
      rating: (a, b) => b.rating - a.rating,
      priceLow: (a, b) => a.priceFrom - b.priceFrom,
      priceHigh: (a, b) => b.priceFrom - a.priceFrom,
    }

    return [...list].sort(sorters[filters.sort] ?? sorters.soonest)
  }, [filters, position])

  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE))
  const pageItems = results.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const activeCategory =
    filters.categories.length === 1 ? categories.find((c) => c.id === filters.categories[0]) : null

  const heading = activeCategory
    ? `${activeCategory.name} events`
    : filters.type === 'online'
      ? 'Online events'
      : filters.price === 'free'
        ? 'Free events'
        : 'Discover events'

  return (
    <>
      <Seo
        title={heading}
        description={`Browse ${results.length} upcoming events on Eventspady. Filter by category, city, date, price and ticket type, then book in seconds.`}
        keywords="find events, browse events, book tickets, upcoming events near me"
      />

      {/* Page header */}
      <div className="relative overflow-hidden border-b border-ink-200/70 bg-ink-50 dark:border-white/10 dark:bg-white/[.02]">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand-500/10 blur-3xl"
          aria-hidden="true"
        />
        <Container className="relative py-10 sm:py-14">
          <Breadcrumbs items={[{ label: 'Events' }]} className="mb-5" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold sm:text-4xl lg:text-[2.75rem]">{heading}</h1>
              <p className="mt-3 max-w-xl text-pretty text-ink-500 dark:text-ink-300">
                {results.length} {results.length === 1 ? 'event' : 'events'} match your filters. Refine by
                category, city, date or ticket type.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                updateFilters({ q: searchInput.trim() })
              }}
              className="flex w-full max-w-md gap-2"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                <label htmlFor="events-search" className="sr-only">
                  Search events
                </label>
                <input
                  id="events-search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search events, cities, tags…"
                  className="field h-11 pl-10"
                />
              </div>
              <Button type="submit" className="h-11 shrink-0">
                Search
              </Button>
            </form>
          </div>
        </Container>
      </div>

      <Section size="tight">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[17rem_1fr] lg:gap-10">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <div className="surface p-5">
                  <EventFilters
                    filters={filters}
                    onChange={updateFilters}
                    onReset={resetFilters}
                    onUseLocation={onUseLocation}
                    locationStatus={locationStatus}
                  />
                </div>
              </div>
            </aside>

            <div className="min-w-0">
              {/* Toolbar */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  iconLeft={SlidersHorizontal}
                  onClick={() => setDrawerOpen(true)}
                  className="lg:hidden"
                >
                  Filters
                </Button>

                <div className="ml-auto flex items-center gap-2">
                  <label htmlFor="sort" className="hidden text-sm text-ink-500 dark:text-ink-400 sm:block">
                    Sort by
                  </label>
                  <select
                    id="sort"
                    value={filters.sort}
                    onChange={(e) => updateFilters({ sort: e.target.value })}
                    disabled={filters.near}
                    className="field h-10 w-auto cursor-pointer py-0 text-sm"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <div className="hidden items-center gap-1 rounded-xl border border-ink-200 p-1 dark:border-white/10 sm:flex">
                    {[
                      { id: 'grid', icon: LayoutGrid, label: 'Grid view' },
                      { id: 'list', icon: List, label: 'List view' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setView(option.id)}
                        aria-label={option.label}
                        aria-pressed={view === option.id}
                        className={cn(
                          'grid size-8 place-items-center rounded-lg transition',
                          view === option.id
                            ? 'bg-brand-600 text-white'
                            : 'text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-white/10',
                        )}
                      >
                        <option.icon className="size-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <ActiveFilterChips filters={filters} onChange={updateFilters} onReset={resetFilters} />

              {pageItems.length === 0 ? (
                <EmptyState
                  icon={CalendarSearch}
                  title="No events match those filters"
                  description="Try widening the date range, clearing a category, or searching for something broader."
                  action={
                    <Button onClick={resetFilters} variant="outline">
                      Reset filters
                    </Button>
                  }
                />
              ) : (
                <div
                  className={cn(
                    view === 'grid' ? 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-4',
                  )}
                >
                  {pageItems.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      variant={view === 'list' ? 'horizontal' : 'default'}
                    />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={(next) => {
                    setPage(next)
                    window.scrollTo({ top: 240, behavior: 'smooth' })
                  }}
                  className="mt-12"
                />
              )}
            </div>
          </div>
        </Container>
      </Section>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[85] lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-ink-950/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] animate-scale-in flex-col rounded-t-3xl bg-white dark:bg-ink-950">
            <div className="flex items-center justify-between border-b border-ink-200/70 p-4 dark:border-white/10">
              <h2 className="text-lg font-bold">Filters</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="grid size-10 place-items-center rounded-xl text-ink-500 transition hover:bg-ink-100 dark:hover:bg-white/10"
                aria-label="Close filters"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <EventFilters
                filters={filters}
                onChange={updateFilters}
                onReset={resetFilters}
                onUseLocation={onUseLocation}
                locationStatus={locationStatus}
              />
            </div>

            <div className="border-t border-ink-200/70 p-4 dark:border-white/10">
              <Button fullWidth size="lg" onClick={() => setDrawerOpen(false)}>
                Show {results.length} {results.length === 1 ? 'event' : 'events'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
