import { useNavigate } from 'react-router-dom'
import { ArrowRight, Minus, Plus, ShieldCheck, Ticket as TicketIcon } from 'lucide-react'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { useCart } from '@context/CartContext'
import { useToast } from '@context/ToastContext'
import { TICKET_TYPES } from '@lib/constants'
import { cn, formatCurrency, formatDate } from '@lib/utils'

/** `onDelta` applies a relative change so rapid clicks never drop an increment. */
function QuantityStepper({ value, onDelta, max, disabled }) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-ink-200 p-1 dark:border-white/10">
      <button
        type="button"
        onClick={() => onDelta(-1)}
        disabled={disabled || value <= 0}
        aria-label="Decrease quantity"
        className="grid size-8 place-items-center rounded-lg text-ink-600 transition hover:bg-ink-100 disabled:opacity-30 dark:text-ink-300 dark:hover:bg-white/10"
      >
        <Minus className="size-4" />
      </button>
      <span className="w-8 text-center text-sm font-bold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onDelta(1)}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className="grid size-8 place-items-center rounded-lg text-ink-600 transition hover:bg-ink-100 disabled:opacity-30 dark:text-ink-300 dark:hover:bg-white/10"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}

/** Ticket list with quantity steppers and a live order total. */
export function TicketSelector({ event, className }) {
  const { cart, summary, addTicket } = useCart()
  const toast = useToast()
  const navigate = useNavigate()

  const isThisEvent = cart.eventId === event.id
  const lines = isThisEvent ? cart.lines : {}
  const count = isThisEvent ? summary.count : 0
  const subtotal = isThisEvent ? summary.subtotal : 0

  const onCheckout = () => {
    if (count === 0) {
      toast.warning('Choose at least one ticket to continue.')
      return
    }
    navigate('/checkout')
  }

  return (
    <div className={cn('surface overflow-hidden', className)}>
      <div className="border-b border-ink-200/70 bg-ink-50 px-5 py-4 dark:border-white/10 dark:bg-white/[.03]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Tickets from</p>
            <p className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">
              {event.isFree ? 'Free' : formatCurrency(event.priceFrom)}
            </p>
          </div>
          {event.soldOut ? (
            <Badge tone="danger">Sold out</Badge>
          ) : (
            <Badge tone="success">{event.remaining.toLocaleString()} left</Badge>
          )}
        </div>
      </div>

      <div className="divide-y divide-ink-200/70 dark:divide-white/10">
        {event.tickets.map((ticket) => {
          const quantity = lines[ticket.id] ?? 0
          const soldOut = ticket.remaining <= 0
          const salesClosed = new Date(ticket.salesEnd) < new Date()
          const disabled = soldOut || salesClosed
          const max = Math.min(ticket.perOrderLimit, ticket.remaining)

          return (
            <div key={ticket.id} className={cn('p-5', disabled && 'opacity-60')}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold">{ticket.name}</h3>
                    <Badge tone="neutral" size="sm">
                      {TICKET_TYPES[ticket.type]?.label ?? ticket.type}
                    </Badge>
                    {ticket.popular && !disabled && (
                      <Badge tone="accent" size="sm">
                        Popular
                      </Badge>
                    )}
                  </div>

                  <p className="mt-1.5 text-xs leading-relaxed text-ink-500 dark:text-ink-400">
                    {ticket.description}
                  </p>

                  <p className="mt-2 text-xs text-ink-400">
                    {soldOut
                      ? 'Sold out'
                      : salesClosed
                        ? 'Sales have closed'
                        : `Sales close ${formatDate(ticket.salesEnd)} · max ${ticket.perOrderLimit} per order`}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-lg font-extrabold">
                    {ticket.price === 0 ? 'Free' : formatCurrency(ticket.price)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                {!disabled && ticket.remaining <= 25 && (
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Only {ticket.remaining} left
                  </span>
                )}
                <QuantityStepper
                  value={quantity}
                  max={max}
                  disabled={disabled}
                  onDelta={(delta) => addTicket(event.id, ticket.id, delta, max)}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-ink-200/70 bg-ink-50 p-5 dark:border-white/10 dark:bg-white/[.03]">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-ink-500 dark:text-ink-400">
            {count} {count === 1 ? 'ticket' : 'tickets'}
          </span>
          <span className="text-xl font-extrabold">{formatCurrency(subtotal)}</span>
        </div>

        <Button fullWidth size="lg" iconRight={ArrowRight} onClick={onCheckout} disabled={event.soldOut}>
          {event.soldOut ? 'Sold out' : count > 0 ? 'Continue to checkout' : 'Select tickets'}
        </Button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-400">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Secure checkout · Taxes shown before payment
        </p>
      </div>
    </div>
  )
}

/** Sticky mobile bar mirroring the selector's primary action. */
export function MobileTicketBar({ event }) {
  const { cart, summary } = useCart()
  const navigate = useNavigate()
  const isThisEvent = cart.eventId === event.id
  const count = isThisEvent ? summary.count : 0

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200/70 bg-white/95 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/95 lg:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-ink-500 dark:text-ink-400">
            {count > 0 ? `${count} ${count === 1 ? 'ticket' : 'tickets'} selected` : 'Tickets from'}
          </p>
          <p className="text-lg font-extrabold leading-tight">
            {count > 0
              ? formatCurrency(summary.subtotal)
              : event.isFree
                ? 'Free'
                : formatCurrency(event.priceFrom)}
          </p>
        </div>
        <Button
          size="lg"
          iconLeft={TicketIcon}
          disabled={event.soldOut}
          onClick={() => {
            if (count > 0) navigate('/checkout')
            else document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
        >
          {event.soldOut ? 'Sold out' : count > 0 ? 'Checkout' : 'Get tickets'}
        </Button>
      </div>
    </div>
  )
}
