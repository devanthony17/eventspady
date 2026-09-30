import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, CornerDownLeft, MapPin, Search, Tag, Users, Video } from 'lucide-react'
import { Modal } from '@components/ui/Modal'
import { useEvents, useCategories, useOrganizers } from '@hooks/api'
import { calendarChip, cn, formatCurrency } from '@lib/utils'

const QUICK_LINKS = [
  { label: 'Browse all events', to: '/events' },
  { label: 'Free events', to: '/events?price=free' },
  { label: 'Online events', to: '/events?type=online' },
  { label: 'This weekend', to: '/events?when=weekend' },
]

/** Command-palette style search over events, categories, venues, and organizers. */
export function SearchDialog({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const { data: eventsData } = useEvents()
  const { data: categoriesData } = useCategories()
  const { data: organizersData } = useOrganizers()

  const storeEvents = useMemo(() => {
    if (Array.isArray(eventsData)) return eventsData
    return eventsData?.events || eventsData?.data || []
  }, [eventsData])

  const categories = useMemo(() => {
    if (Array.isArray(categoriesData)) return categoriesData
    return categoriesData?.categories || categoriesData?.data || []
  }, [categoriesData])

  const organizers = useMemo(() => {
    if (Array.isArray(organizersData)) return organizersData
    return organizersData?.organizers || organizersData?.data || []
  }, [organizersData])
  const navigate = useNavigate()
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return { events: storeEvents.slice(0, 5), categories: [], organizers: [] }

    const matchedEvents = storeEvents
      .filter((e) =>
        [e.title, e.tagline, e.venue?.name, e.venue?.city, e.category, e.organizerName, ...(e.tags || [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 6)

    const matchedCategories = categories.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 3)
    const matchedOrganizers = organizers
      .filter((org) => [org.name, org.location, org.bio].join(' ').toLowerCase().includes(q))
      .slice(0, 3)

    return { events: matchedEvents, categories: matchedCategories, organizers: matchedOrganizers }
  }, [query, storeEvents])

  const flat = useMemo(
    () => [
      ...results.events.map((e) => ({ kind: 'event', to: `/events/${e.slug}`, data: e })),
      ...results.categories.map((c) => ({ kind: 'category', to: `/events?category=${c.id}`, data: c })),
      ...results.organizers.map((org) => ({ kind: 'organizer', to: `/organizers/${org.id}`, data: org })),
    ],
    [results],
  )

  const go = (to) => {
    onClose()
    navigate(to)
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setCursor((c) => Math.min(c + 1, flat.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (flat[cursor]) go(flat[cursor].to)
      else if (query.trim()) go(`/events?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="lg" className="sm:mt-[8vh] sm:self-start">
      <div className="-mx-6 -mt-5">
        <div className="flex items-center gap-3 border-b border-ink-200/70 px-6 py-4 dark:border-white/10">
          <Search className="size-5 shrink-0 text-ink-400" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setCursor(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="Search events, cities or categories…"
            aria-label="Search"
            className="w-full bg-transparent text-base outline-none placeholder:text-ink-400"
          />
          <kbd className="hidden shrink-0 rounded-lg border border-ink-200 px-2 py-1 text-[11px] font-semibold text-ink-500 dark:border-white/15 dark:text-ink-400 sm:block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto px-3 py-3">
          {!query && (
            <div className="mb-2 px-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-400">Quick links</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_LINKS.map((link) => (
                  <button
                    key={link.to}
                    type="button"
                    onClick={() => go(link.to)}
                    className="rounded-lg bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-brand-100 hover:text-brand-700 dark:bg-white/[.06] dark:text-ink-200 dark:hover:bg-brand-500/20"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {flat.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-ink-500">
              No matches for “{query}”. Try a city or a category.
            </p>
          ) : (
            <ul role="listbox" aria-label="Search results">
              {results.events.length > 0 && (
                <li className="px-3 pb-1 pt-3 text-xs font-bold uppercase tracking-wider text-ink-400">Events</li>
              )}
              {results.events.map((event, i) => {
                const chip = calendarChip(event.start)
                return (
                  <li key={event.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => go(`/events/${event.slug}`)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                        cursor === i ? 'bg-brand-50 dark:bg-brand-500/15' : 'hover:bg-ink-50 dark:hover:bg-white/5',
                      )}
                    >
                      <img src={event.cover} alt="" className="size-11 shrink-0 rounded-lg object-cover" loading="lazy" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{event.title}</span>
                        <span className="mt-0.5 flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                          <CalendarDays className="size-3" aria-hidden="true" />
                          {chip.month} {chip.day}
                          <span aria-hidden="true">·</span>
                          {event.type === 'online' ? (
                            <>
                              <Video className="size-3" aria-hidden="true" /> Online
                            </>
                          ) : (
                            <>
                              <MapPin className="size-3" aria-hidden="true" />
                              {event.venue.city}
                            </>
                          )}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-bold text-brand-600 dark:text-brand-400">
                        {event.isFree ? 'Free' : formatCurrency(event.priceFrom)}
                      </span>
                      {cursor === i && <CornerDownLeft className="size-3.5 shrink-0 text-ink-400" aria-hidden="true" />}
                    </button>
                  </li>
                )
              })}

              {results.categories.length > 0 && (
                <li className="px-3 pb-1 pt-4 text-xs font-bold uppercase tracking-wider text-ink-400">Categories</li>
              )}
              {results.categories.map((category, i) => {
                const index = results.events.length + i
                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setCursor(index)}
                      onClick={() => go(`/events?category=${category.id}`)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                        cursor === index ? 'bg-brand-50 dark:bg-brand-500/15' : 'hover:bg-ink-50 dark:hover:bg-white/5',
                      )}
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#dce6fa] bg-white text-[#2d2942] shadow-xs dark:border-blue-400/20 dark:bg-ink-800 dark:text-ink-100">
                        {category.icon && typeof category.icon !== 'string' ? (
                          <category.icon className="size-5" aria-hidden="true" />
                        ) : (
                          <Tag className="size-4" aria-hidden="true" />
                        )}
                      </span>
                      <span className="flex-1 text-sm font-semibold">{category.name}</span>
                      <span className="text-xs text-ink-500">{category.count} events</span>
                    </button>
                  </li>
                )
              })}

              {results.organizers?.length > 0 && (
                <li className="px-3 pb-1 pt-4 text-xs font-bold uppercase tracking-wider text-ink-400">Organizers</li>
              )}
              {results.organizers?.map((org, i) => {
                const index = results.events.length + results.categories.length + i
                return (
                  <li key={org.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setCursor(index)}
                      onClick={() => go(`/organizers/${org.id}`)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                        cursor === index ? 'bg-brand-50 dark:bg-brand-500/15' : 'hover:bg-ink-50 dark:hover:bg-white/5',
                      )}
                    >
                      {org.logo ? (
                        <img src={org.logo} alt="" className="size-11 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                          <Users className="size-4" aria-hidden="true" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{org.name}</span>
                        <span className="mt-0.5 block truncate text-xs text-ink-500 dark:text-ink-400">
                          {org.location} · {org.events || 1} event{org.events === 1 ? '' : 's'}
                        </span>
                      </span>
                      {cursor === index && <CornerDownLeft className="size-3.5 shrink-0 text-ink-400" aria-hidden="true" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  )
}
