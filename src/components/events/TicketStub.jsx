import { QRCodeSVG } from 'qrcode.react'
import { CalendarDays, MapPin, Video } from 'lucide-react'
import { Badge } from '@components/ui/Badge'
import { cn, formatDate, formatTime } from '@lib/utils'

/**
 * A printable ticket stub with its QR code.
 * The code encodes the ticket reference only — never personal data.
 */
export function TicketStub({ event, ticketName, code, holder, checkedIn = false, className }) {
  const isOnline = event.type === 'online'

  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-soft dark:border-white/10 dark:bg-ink-900',
        className,
      )}
    >
      <div className="grid sm:grid-cols-[1fr_auto]">
        <div className="p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge tone="brand" size="sm">
              {ticketName}
            </Badge>
            {checkedIn ? (
              <Badge tone="success" size="sm">
                Checked in
              </Badge>
            ) : (
              <Badge tone="neutral" size="sm">
                Not scanned
              </Badge>
            )}
          </div>

          <h3 className="text-base font-bold leading-snug">{event.title}</h3>

          <dl className="mt-3 space-y-1.5 text-xs text-ink-500 dark:text-ink-400">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
              <dd>
                {formatDate(event.start, { weekday: 'short' })} · {formatTime(event.start)}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Video className="size-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              )}
              <dd className="truncate">
                {isOnline ? event.online.platform : `${event.venue.name}, ${event.venue.city}`}
              </dd>
            </div>
          </dl>

          {holder && (
            <p className="mt-4 border-t border-dashed border-ink-200 pt-3 text-xs dark:border-white/15">
              <span className="text-ink-400">Admits</span>{' '}
              <span className="font-bold text-ink-800 dark:text-ink-100">{holder}</span>
            </p>
          )}
        </div>

        {/* Perforated QR panel */}
        <div className="relative flex flex-col items-center justify-center gap-2 border-t border-dashed border-ink-300 bg-ink-50 p-5 dark:border-white/20 dark:bg-white/[.04] sm:border-l sm:border-t-0">
          <span
            className="absolute -left-2.5 -top-2.5 hidden size-5 rounded-full bg-white dark:bg-ink-950 sm:block"
            aria-hidden="true"
          />
          <span
            className="absolute -bottom-2.5 -left-2.5 hidden size-5 rounded-full bg-white dark:bg-ink-950 sm:block"
            aria-hidden="true"
          />

          <div className="rounded-xl bg-white p-2.5">
            <QRCodeSVG value={code} size={104} level="M" marginSize={0} />
          </div>
          <p className="font-mono text-[11px] font-bold tracking-wider text-ink-600 dark:text-ink-300">{code}</p>
        </div>
      </div>
    </article>
  )
}
