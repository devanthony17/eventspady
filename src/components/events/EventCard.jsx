import { Link } from 'react-router-dom'
import { Heart, MapPin, Users, Video } from 'lucide-react'
import { Ticket } from '@components/icons/AppIcons'
import { Badge } from '@components/ui/Badge'
import { useWishlist } from '@hooks/useWishlist'
import { useToast } from '@context/ToastContext'
import { calendarChip, cn, formatCurrency, formatDistance, formatTime } from '@lib/utils'

function SaveButton({ event, className }) {
  const { has, toggle } = useWishlist()
  const toast = useToast()
  const saved = has(event.id)

  const onClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const added = toggle(event.id)
    toast.success(added ? `Saved “${event.title}”` : `Removed “${event.title}” from saved`)
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={saved ? 'Remove from saved events' : 'Save this event'}
      aria-pressed={saved}
      className={cn(
        'grid size-9 place-items-center rounded-full backdrop-blur-md transition',
        saved
          ? 'bg-rose-500 text-white'
          : 'bg-white/85 text-ink-700 hover:bg-white hover:text-rose-500 dark:bg-ink-900/80 dark:text-ink-200',
        className,
      )}
    >
      <Heart className={cn('size-4', saved && 'fill-current')} />
    </button>
  )
}

/**
 * Event card. `variant`:
 *  - `default` — vertical card for grids
 *  - `horizontal` — image left, details right (list view)
 *  - `compact` — small row for sidebars
 */
export function EventCard({ event, variant = 'default', className, showSave = true }) {
  const chip = calendarChip(event.start)
  const isOnline = event.type === 'online'
  const almostGone = !event.soldOut && event.remaining <= event.capacity * 0.12

  const priceLabel = event.isFree
    ? 'Free'
    : formatCurrency(event.priceFrom)

  if (variant === 'compact') {
    return (
      <Link
        to={`/events/${event.slug}`}
        className={cn('group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-ink-50 dark:hover:bg-white/5', className)}
      >
        <img
          src={event.cover}
          alt=""
          loading="lazy"
          className="size-16 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            {chip.month} {chip.day} · {formatTime(event.start)}
          </p>
          <h3 className="mt-0.5 truncate text-sm font-bold transition group-hover:text-brand-600 dark:group-hover:text-brand-400">
            {event.title}
          </h3>
          <p className="mt-0.5 truncate text-xs text-ink-500 dark:text-ink-400">
            {isOnline ? 'Online event' : event.venue.city}
          </p>
        </div>
        <span className="shrink-0 text-sm font-bold text-brand-600 dark:text-brand-400">
          {event.isFree ? 'Free' : formatCurrency(event.priceFrom)}
        </span>
      </Link>
    )
  }

  if (variant === 'horizontal') {
    return (
      <article
        className={cn(
          'surface group grid overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:shadow-card sm:grid-cols-[15rem_1fr]',
          className,
        )}
      >
        <Link to={`/events/${event.slug}`} className="relative block aspect-[16/10] overflow-hidden sm:aspect-auto">
          <img
            src={event.cover}
            alt=""
            loading="lazy"
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            <CalendarChip chip={chip} />
          </div>
        </Link>

        <div className="flex flex-col p-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone="brand" size="sm" icon={event.categoryMeta?.icon}>
              {event.categoryMeta?.name}
            </Badge>
            <Badge tone={isOnline ? 'info' : 'neutral'} size="sm" icon={isOnline ? Video : MapPin}>
              {isOnline ? 'Online' : event.venue.city}
            </Badge>
            {event.distanceKm != null && (
              <Badge tone="accent" size="sm" icon={MapPin}>
                {formatDistance(event.distanceKm)}
              </Badge>
            )}
            {event.soldOut && (
              <Badge tone="danger" size="sm">
                Sold out
              </Badge>
            )}
            {almostGone && (
              <Badge tone="warning" size="sm">
                Almost gone
              </Badge>
            )}
          </div>

          <h3 className="text-lg font-bold leading-snug">
            <Link to={`/events/${event.slug}`} className="transition hover:text-brand-600 dark:hover:text-brand-400">
              {event.title}
            </Link>
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-ink-500 dark:text-ink-400">{event.tagline}</p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-500 dark:text-ink-400">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Users className="size-3.5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
              {event.sold?.toLocaleString() ?? 0} going
            </span>
            {event.organizer?.name && (
              <span className="inline-flex items-center gap-1.5 truncate">
                <img
                  src={event.organizer?.logo || '/images/organizers/organizer-1.svg'}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/images/organizers/organizer-1.svg'
                  }}
                  className="size-4 shrink-0 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/10"
                />
                <span className="truncate font-semibold text-ink-700 dark:text-ink-200">{event.organizer.name}</span>
              </span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 pt-4">
            <div>
              <p className="text-xs text-ink-400">Tickets</p>
              <p className="text-lg font-extrabold text-brand-600 dark:text-brand-400">{priceLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              {showSave && <SaveButton event={event} />}
              <Link
                to={`/events/${event.slug}`}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                <Ticket className="size-4" aria-hidden="true" />
                Book now
              </Link>
            </div>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article
      className={cn(
        'surface group relative flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-card',
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={event.cover}
          alt=""
          loading="lazy"
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <CalendarChip chip={chip} />
          {/* Sits above the card-wide overlay link so saving never navigates. */}
          {showSave && <SaveButton event={event} className="relative z-20" />}
        </div>

        <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-1.5">
          <Badge tone="glass" size="sm" icon={isOnline ? Video : MapPin}>
            {isOnline ? 'Online' : event.venue.city}
          </Badge>
          {event.distanceKm != null && (
            <Badge tone="glass" size="sm" icon={MapPin} className="bg-brand-950/80 text-brand-300 ring-1 ring-brand-400/40">
              {formatDistance(event.distanceKm)}
            </Badge>
          )}
          {event.soldOut ? (
            <Badge tone="danger" size="sm">
              Sold out
            </Badge>
          ) : (
            almostGone && (
              <Badge tone="warning" size="sm">
                Almost gone
              </Badge>
            )
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Badge tone="brand" size="sm" icon={event.categoryMeta?.icon}>
            {event.categoryMeta?.name}
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-500 dark:text-ink-400">
            <Users className="size-3.5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
            <span>{event.sold?.toLocaleString() ?? 0} going</span>
          </span>
        </div>

        <h3 className="text-base font-bold leading-snug sm:text-lg">
          <Link
            to={`/events/${event.slug}`}
            className="transition after:absolute after:inset-0 after:z-10 hover:text-brand-600 dark:hover:text-brand-400"
          >
            {event.title}
          </Link>
        </h3>

        <p className="mt-1.5 line-clamp-2 text-sm text-ink-500 dark:text-ink-400">{event.tagline}</p>

        <div className="mt-4 flex items-center gap-2.5 border-t border-ink-200/70 pt-4 dark:border-white/10">
          <img
            src={event.organizer?.logo || '/images/organizers/organizer-1.svg'}
            alt={event.organizer?.name || 'Organizer'}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = '/images/organizers/organizer-1.svg'
            }}
            className="size-7 shrink-0 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/10"
          />
          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink-700 dark:text-ink-200">
            {event.organizer?.name || 'Organizer'}
          </span>
          <span className="shrink-0 text-sm font-extrabold text-brand-600 dark:text-brand-400">{priceLabel}</span>
        </div>
      </div>
    </article>
  )
}

function CalendarChip({ chip }) {
  return (
    <span className="grid w-12 shrink-0 place-items-center rounded-xl bg-white/90 px-1 py-1.5 text-center shadow-sm backdrop-blur-md dark:bg-ink-900/85">
      <span className="text-[10px] font-extrabold uppercase leading-none tracking-wider text-brand-600 dark:text-brand-400">
        {chip.month}
      </span>
      <span className="text-lg font-extrabold leading-tight text-ink-900 dark:text-white">{chip.day}</span>
    </span>
  )
}
