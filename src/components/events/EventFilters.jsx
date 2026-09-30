import { useMemo } from 'react'
import {
  Briefcase,
  Cpu,
  HeartHandshake,
  Landmark,
  LocateFixed,
  Music,
  Palette,
  RotateCcw,
  Tag,
  Trophy,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { Button } from '@components/ui/Button'
import { Checkbox } from '@components/ui/Field'
import { useCategories, useEvents } from '@hooks/api'
import { TICKET_TYPES } from '@lib/constants'
import { cn } from '@lib/utils'
import { useLocationContext } from '@context/LocationContext'

const CATEGORY_ICONS = {
  music: Music,
  culture: Landmark,
  business: Briefcase,
  sports: Trophy,
  tech: Cpu,
  arts: Palette,
  food: UtensilsCrossed,
  community: HeartHandshake,
}

const DEFAULT_CATEGORIES = [
  { id: 'music', name: 'Music' },
  { id: 'culture', name: 'Culture & Festivals' },
  { id: 'business', name: 'Business & Networking' },
  { id: 'sports', name: 'Sports & Fitness' },
  { id: 'tech', name: 'Technology & Gaming' },
  { id: 'arts', name: 'Arts & Theatre' },
  { id: 'food', name: 'Food & Drink' },
  { id: 'community', name: 'Community & Charity' },
]

const PRICE_OPTIONS = [
  { id: 'all', label: 'Any price' },
  { id: 'free', label: 'Free only' },
  { id: 'paid', label: 'Paid only' },
  { id: 'under100', label: 'Under GH₵100' },
  { id: 'under300', label: 'Under GH₵300' },
]

const WHEN_OPTIONS = [
  { id: '', label: 'Any date' },
  { id: 'today', label: 'Today' },
  { id: 'weekend', label: 'This weekend' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
]

function Group({ title, children }) {
  return (
    <div className="border-b border-ink-200/70 py-5 first:pt-0 last:border-0 dark:border-white/10">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-900 dark:text-white">{title}</h3>
      {children}
    </div>
  )
}

/**
 * Filter panel shared by the sidebar (desktop) and the drawer (mobile).
 * Fully controlled — `filters` and `onChange` come from the URL search params.
 */
export function EventFilters({ filters, onChange, onReset, onUseLocation, locationStatus, cities, className }) {
  const { locationName, openLocationModal } = useLocationContext()
  const { data: categoriesData } = useCategories()
  const { data: eventsData } = useEvents()

  const categories = useMemo(() => {
    if (Array.isArray(categoriesData) && categoriesData.length > 0) return categoriesData
    if (Array.isArray(categoriesData?.categories) && categoriesData.categories.length > 0) return categoriesData.categories
    return DEFAULT_CATEGORIES
  }, [categoriesData])

  const availableCities = useMemo(() => {
    if (cities && cities.length > 0) return cities
    const evts = Array.isArray(eventsData) ? eventsData : eventsData?.events || []
    const set = new Set(evts.map((e) => e.venue?.city).filter(Boolean))
    if (set.size > 0) return Array.from(set).sort()
    return ['Wa', 'Nandom', 'Jirapa', 'Lawra', 'Accra']
  }, [cities, eventsData])

  const toggleCategory = (id) => {
    const next = filters.categories.includes(id)
      ? filters.categories.filter((c) => c !== id)
      : [...filters.categories, id]
    onChange({ categories: next })
  }

  const toggleTicketType = (id) => {
    const next = filters.ticketTypes.includes(id)
      ? filters.ticketTypes.filter((t) => t !== id)
      : [...filters.ticketTypes, id]
    onChange({ ticketTypes: next })
  }

  return (
    <div className={cn('divide-y divide-ink-200/70 dark:divide-white/10', className)}>
      <Group title="Event type">
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: '', label: 'All' },
            { id: 'venue', label: 'Venue' },
            { id: 'online', label: 'Online' },
          ].map((option) => (
            <button
              key={option.id || 'all'}
              type="button"
              onClick={() => onChange({ type: option.id })}
              className={cn(
                'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                filters.type === option.id
                  ? 'border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-500/15 dark:text-brand-300'
                  : 'border-ink-200 text-ink-600 hover:border-ink-300 dark:border-white/10 dark:text-ink-300 dark:hover:border-white/20',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Category">
        <div className="max-h-64 space-y-2.5 overflow-y-auto pr-1">
          {categories.map((category) => {
            const Icon = category.icon || CATEGORY_ICONS[category.id] || Tag
            return (
              <Checkbox
                key={category.id}
                checked={filters.categories.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
                label={
                  <span className="flex items-center gap-2">
                    <Icon className="size-4 shrink-0 text-ink-600 dark:text-ink-300" aria-hidden="true" />
                    <span>{category.name}</span>
                  </span>
                }
              />
            )
          })}
        </div>
      </Group>

      <Group title="Date">
        <div className="flex flex-wrap gap-1.5">
          {WHEN_OPTIONS.map((option) => (
            <button
              key={option.id || 'any'}
              type="button"
              onClick={() => onChange({ when: option.id })}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                filters.when === option.id
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-ink-200 text-ink-600 hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:text-ink-300 dark:hover:border-brand-500/40',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Price">
        <div className="space-y-1">
          {PRICE_OPTIONS.map((option) => (
            <label
              key={option.id}
              className={cn(
                'flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition',
                filters.price === option.id
                  ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                  : 'text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-white/5',
              )}
            >
              <input
                type="radio"
                name="price"
                checked={filters.price === option.id}
                onChange={() => onChange({ price: option.id })}
                className="size-4 accent-brand-600"
              />
              {option.label}
            </label>
          ))}
        </div>
      </Group>

      <Group title="Ticket type">
        <div className="space-y-2.5">
          {Object.entries(TICKET_TYPES).map(([id, meta]) => (
            <Checkbox
              key={id}
              checked={filters.ticketTypes.includes(id)}
              onChange={() => toggleTicketType(id)}
              label={meta.label}
              description={meta.description}
            />
          ))}
        </div>
      </Group>

      <Group title="Location">
        <select
          value={filters.city}
          onChange={(e) => onChange({ city: e.target.value })}
          className="field"
          aria-label="Filter by city"
        >
          <option value="">Anywhere</option>
          {availableCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <div className="mt-3 flex flex-col gap-2">
          <Button
            variant={filters.near ? 'primary' : 'outline'}
            size="sm"
            fullWidth
            iconLeft={LocateFixed}
            loading={locationStatus === 'pending'}
            onClick={onUseLocation}
          >
            {filters.near ? (locationName ? `Near ${locationName}` : 'Sorted by distance') : 'Events near me'}
          </Button>
          {filters.near && (
            <button
              type="button"
              onClick={openLocationModal}
              className="text-center text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              Change location / city
            </button>
          )}
        </div>
      </Group>

      <div className="pt-5">
        <Button variant="ghost" size="sm" fullWidth iconLeft={RotateCcw} onClick={onReset}>
          Reset all filters
        </Button>
      </div>
    </div>
  )
}

/** Removable chips summarising the filters currently applied. */
export function ActiveFilterChips({ filters, onChange, onReset }) {
  const { data: categoriesData } = useCategories()
  const categories = useMemo(() => {
    if (Array.isArray(categoriesData) && categoriesData.length > 0) return categoriesData
    if (Array.isArray(categoriesData?.categories) && categoriesData.categories.length > 0) return categoriesData.categories
    return DEFAULT_CATEGORIES
  }, [categoriesData])

  const chips = []

  if (filters.q) chips.push({ key: 'q', label: `“${filters.q}”`, clear: { q: '' } })
  if (filters.type) chips.push({ key: 'type', label: filters.type === 'online' ? 'Online' : 'Venue', clear: { type: '' } })
  if (filters.city) chips.push({ key: 'city', label: filters.city, clear: { city: '' } })
  if (filters.when) chips.push({ key: 'when', label: filters.when, clear: { when: '' } })
  if (filters.price !== 'all') chips.push({ key: 'price', label: filters.price, clear: { price: 'all' } })
  if (filters.near) chips.push({ key: 'near', label: 'Near me', clear: { near: false } })

  filters.categories.forEach((id) => {
    const category = categories.find((c) => c.id === id)
    if (category) {
      const Icon = category.icon || CATEGORY_ICONS[category.id] || Tag
      chips.push({
        key: `cat-${id}`,
        label: category.name,
        icon: Icon,
        clear: { categories: filters.categories.filter((c) => c !== id) },
      })
    }
  })

  filters.ticketTypes.forEach((id) => {
    chips.push({
      key: `tkt-${id}`,
      label: TICKET_TYPES[id]?.label ?? id,
      clear: { ticketTypes: filters.ticketTypes.filter((t) => t !== id) },
    })
  })

  if (chips.length === 0) return null

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onChange(chip.clear)}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1.5 pl-3 pr-2 text-xs font-semibold capitalize text-brand-700 transition hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-300 dark:hover:bg-brand-500/25"
        >
          {chip.icon && <chip.icon className="size-3.5 shrink-0" aria-hidden="true" />}
          {chip.label}
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="text-xs font-semibold text-ink-500 underline-offset-4 transition hover:text-ink-800 hover:underline dark:text-ink-400 dark:hover:text-white"
      >
        Clear all
      </button>
    </div>
  )
}
