import { useNavigate } from 'react-router-dom'
import { ArrowRight, Car, Check, Clock, Droplets, Minus, Plus, ShieldCheck, Sparkles, Store, Users, Wine, Zap } from 'lucide-react'
import { TicketIcon } from '@components/icons/AppIcons'
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
            <Badge tone="success">{(event.remaining ?? 100).toLocaleString()} left</Badge>
          )}
        </div>
      </div>

      <div className="divide-y divide-ink-200/70 dark:divide-white/10">
        {event.tickets.map((ticket) => {
          const quantity = lines[ticket.id] ?? 0
          const soldOut = (ticket.remaining ?? 100) <= 0
          const salesClosed = ticket.salesEnd ? new Date(ticket.salesEnd).getTime() < Date.now() : false
          const disabled = soldOut || salesClosed
          const max = Math.min(ticket.perOrderLimit || 10, ticket.remaining ?? 100)
          const isTable = ticket.type === 'table'
          const isVendor = ticket.type === 'vendor'

          return (
            <div
              key={ticket.id}
              className={cn(
                'p-5 transition',
                disabled && 'opacity-60',
                isTable && 'bg-purple-500/[.02] dark:bg-purple-950/[.04]',
                isVendor && 'bg-emerald-500/[.02] dark:bg-emerald-950/[.04]',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-ink-900 dark:text-white">{ticket.name}</h3>
                    {isTable ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-purple-200/60 bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:border-purple-800/40 dark:bg-purple-950/40 dark:text-purple-300">
                        <Wine className="size-3" /> Table Reservation
                      </span>
                    ) : isVendor ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <Store className="size-3" /> Vendor Space
                      </span>
                    ) : (
                      <Badge tone="neutral" size="sm">
                        {TICKET_TYPES[ticket.type]?.label ?? ticket.type}
                      </Badge>
                    )}
                    {ticket.popular && !disabled && (
                      <Badge tone="accent" size="sm">
                        Popular
                      </Badge>
                    )}
                  </div>

                  {/* Micro Specs for Tables and Vendors */}
                  {isTable && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                        <Users className="size-3" /> Seats {ticket.seatsPerTable || 4} guests
                      </span>
                      {ticket.tableLocation && (
                        <span className="text-ink-500 dark:text-ink-400 font-medium">
                          Zone: {ticket.tableLocation}
                        </span>
                      )}
                      {ticket.dedicatedWaiter && (
                        <span className="inline-flex items-center gap-1 rounded bg-purple-100/70 px-1.5 py-0.5 text-[11px] font-semibold text-purple-800 dark:bg-purple-900/40 dark:text-purple-200">
                          <Check className="size-3" /> Dedicated Server
                        </span>
                      )}
                      {ticket.vipParking > 0 && (
                        <span className="inline-flex items-center gap-1 rounded bg-purple-100/70 px-1.5 py-0.5 text-[11px] font-semibold text-purple-800 dark:bg-purple-900/40 dark:text-purple-200">
                          <Car className="size-3" /> {ticket.vipParking} VIP Parking
                        </span>
                      )}
                      {ticket.expressEntry && (
                        <span className="inline-flex items-center gap-1 rounded bg-purple-100/70 px-1.5 py-0.5 text-[11px] font-semibold text-purple-800 dark:bg-purple-900/40 dark:text-purple-200">
                          <Sparkles className="size-3" /> Express Gate
                        </span>
                      )}
                      {ticket.minSpend > 0 && (
                        <span className="font-semibold text-purple-700 dark:text-purple-300">
                          · GH₵{ticket.minSpend} Bar Credit Included
                        </span>
                      )}
                    </div>
                  )}

                  {isTable && ticket.tablePackage && (
                    <div className="mt-2.5 flex items-start gap-1.5 rounded-xl border border-purple-200/60 bg-purple-50/70 p-2.5 text-xs font-medium text-purple-800 dark:border-purple-800/40 dark:bg-purple-950/30 dark:text-purple-200">
                      <Wine className="mt-0.5 size-3.5 shrink-0 text-purple-600 dark:text-purple-400" />
                      <span>{ticket.tablePackage}</span>
                    </div>
                  )}

                  {isVendor && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <Store className="size-3" /> {ticket.spaceSize || '10x10 ft Space'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-ink-600 dark:text-ink-400 font-medium">
                        <Zap className="size-3 text-amber-500" />
                        {ticket.powerIncluded !== false ? 'Power Included' : 'No power hookup'}
                      </span>
                      {ticket.waterIncluded && (
                        <span className="inline-flex items-center gap-1 text-ink-600 dark:text-ink-400 font-medium">
                          <Droplets className="size-3 text-cyan-500" /> Water Point
                        </span>
                      )}
                      {ticket.passesIncluded && (
                        <span className="text-ink-500 dark:text-ink-400 font-medium">
                          · {ticket.passesIncluded} staff passes
                        </span>
                      )}
                      {ticket.tablesChairsIncluded && (
                        <span className="text-ink-500 dark:text-ink-400 font-medium">
                          · {ticket.tablesChairsIncluded}
                        </span>
                      )}
                      {ticket.vendorCategory && (
                        <span className="text-ink-500 dark:text-ink-400 font-medium">
                          · {ticket.vendorCategory}
                        </span>
                      )}
                      {ticket.setupHours && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-ink-400">
                          <Clock className="size-3" /> {ticket.setupHours}
                        </span>
                      )}
                    </div>
                  )}

                  {ticket.description && (
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-500 dark:text-ink-400">
                      {ticket.description}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-ink-400">
                    {soldOut
                      ? 'Sold out'
                      : salesClosed
                        ? 'Sales have closed'
                        : `Sales close ${formatDate(ticket.salesEnd)} · max ${ticket.perOrderLimit || 10} per order`}
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
                  onDelta={(delta) => addTicket(event.id, ticket.id, delta, max, event)}
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
