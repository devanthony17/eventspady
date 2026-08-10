import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BadgePercent,
  Banknote,
  CalendarDays,
  Check,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  Ticket,
  Trash2,
  Wallet,
  X,
} from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { Container, Section } from '@components/ui/Section'
import { Breadcrumbs } from '@components/ui/Breadcrumbs'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Input, Checkbox } from '@components/ui/Field'
import { EmptyState } from '@components/ui/EmptyState'
import { useCart } from '@context/CartContext'
import { useAuth } from '@context/AuthContext'
import { useToast } from '@context/ToastContext'
import { PAYMENT_METHODS } from '@lib/constants'
import { cn, formatCurrency, formatDateRange, generateOrderId } from '@lib/utils'

const METHOD_ICONS = { wallet: Wallet, offline: Banknote }

export default function Checkout() {
  const { summary, setLine, addTicket, applyCoupon, removeCoupon, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const [method, setMethod] = useState('stripe')
  const [processing, setProcessing] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [buyer, setBuyer] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  })

  const { event, items, count, subtotal, discount, taxLines, tax, total, coupon } = summary

  if (!event || count === 0) {
    return (
      <>
        <Seo title="Checkout" noIndex />
        <Section>
          <Container>
            <EmptyState
              icon={Ticket}
              title="Your booking is empty"
              description="Pick an event and choose your tickets — they will show up here ready for checkout."
              action={
                <Button to="/events" size="lg">
                  Browse events
                </Button>
              }
            />
          </Container>
        </Section>
      </>
    )
  }

  const walletBalance = user?.walletBalance ?? 0
  const walletShort = method === 'wallet' && walletBalance < total

  const onApplyCoupon = (e) => {
    e.preventDefault()
    const result = applyCoupon(couponInput)
    if (result.ok) {
      setCouponError('')
      setCouponInput('')
      toast.success(`Coupon applied — you saved ${formatCurrency(result.discount)}.`)
    } else {
      setCouponError(result.reason)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!agreed) {
      toast.warning('Please accept the terms before completing your booking.')
      return
    }
    if (walletShort) {
      toast.error('Your wallet balance is not enough for this order. Pick another payment method.')
      return
    }

    setProcessing(true)
    await new Promise((r) => setTimeout(r, 1200))

    const order = {
      id: generateOrderId(),
      eventId: event.id,
      eventSlug: event.slug,
      placedAt: new Date().toISOString(),
      buyer,
      method,
      paymentStatus: method === 'offline' ? 'pending' : 'paid',
      items: items.map((i) => ({ ticketId: i.ticket.id, name: i.ticket.name, quantity: i.quantity, price: i.ticket.price })),
      subtotal,
      discount,
      tax,
      total,
      couponCode: coupon?.code ?? null,
    }

    // Hand the confirmation page its order without a round-trip.
    sessionStorage.setItem('eventspady:lastOrder', JSON.stringify(order))
    clearCart()
    setProcessing(false)
    navigate(`/order/${order.id}`)
  }

  return (
    <>
      <Seo title="Checkout" description={`Complete your booking for ${event.title}.`} noIndex />

      <Section size="tight">
        <Container>
          <Breadcrumbs
            items={[
              { label: 'Events', to: '/events' },
              { label: event.title, to: `/events/${event.slug}` },
              { label: 'Checkout' },
            ]}
            className="mb-6"
          />

          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold sm:text-4xl">Complete your booking</h1>
              <p className="mt-2 text-ink-500 dark:text-ink-300">
                You are booking {count} {count === 1 ? 'ticket' : 'tickets'} for {event.title}.
              </p>
            </div>
            <Button to={`/events/${event.slug}`} variant="ghost" size="sm" iconLeft={ArrowLeft}>
              Back to event
            </Button>
          </div>

          <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_23rem] lg:gap-10">
            <div className="min-w-0 space-y-6">
              {/* Buyer details */}
              <section className="surface p-6">
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-600 text-sm font-extrabold text-white">
                    1
                  </span>
                  <h2 className="text-lg font-bold">Your details</h2>
                </div>

                {!isAuthenticated && (
                  <p className="mb-5 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:bg-brand-500/10 dark:text-brand-200">
                    Booking as a guest.{' '}
                    <Link to="/login" className="font-bold underline underline-offset-2">
                      Sign in
                    </Link>{' '}
                    to keep all your tickets in one place.
                  </p>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Full name"
                    required
                    value={buyer.name}
                    onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                    placeholder="Jordan Avery"
                    autoComplete="name"
                  />
                  <Input
                    label="Email address"
                    type="email"
                    required
                    value={buyer.email}
                    onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
                    placeholder="you@example.com"
                    autoComplete="email"
                    hint="Your tickets and QR codes go here."
                  />
                  <Input
                    label="Phone number"
                    type="tel"
                    value={buyer.phone}
                    onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })}
                    placeholder="+1 (415) 555-0188"
                    autoComplete="tel"
                    wrapperClassName="sm:col-span-2"
                    hint="Optional — used only for urgent event updates."
                  />
                </div>
              </section>

              {/* Tickets */}
              <section className="surface p-6">
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-600 text-sm font-extrabold text-white">
                    2
                  </span>
                  <h2 className="text-lg font-bold">Your tickets</h2>
                </div>

                <ul className="divide-y divide-ink-200/70 dark:divide-white/10">
                  {items.map(({ ticket, quantity, lineTotal }) => (
                    <li key={ticket.id} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold">{ticket.name}</p>
                        <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
                          {ticket.price === 0 ? 'Free' : formatCurrency(ticket.price)} each
                        </p>
                      </div>

                      <div className="flex items-center gap-1 rounded-xl border border-ink-200 p-1 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => addTicket(event.id, ticket.id, -1)}
                          aria-label={`Decrease ${ticket.name}`}
                          className="grid size-7 place-items-center rounded-lg text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/10"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-sm font-bold tabular-nums">{quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            addTicket(event.id, ticket.id, 1, Math.min(ticket.perOrderLimit, ticket.remaining))
                          }
                          aria-label={`Increase ${ticket.name}`}
                          className="grid size-7 place-items-center rounded-lg text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/10"
                        >
                          +
                        </button>
                      </div>

                      <p className="w-20 shrink-0 text-right text-sm font-extrabold">{formatCurrency(lineTotal)}</p>

                      <button
                        type="button"
                        onClick={() => setLine(event.id, ticket.id, 0)}
                        aria-label={`Remove ${ticket.name}`}
                        className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Payment */}
              <section className="surface p-6">
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-600 text-sm font-extrabold text-white">
                    3
                  </span>
                  <h2 className="text-lg font-bold">Payment method</h2>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {PAYMENT_METHODS.map((option) => {
                    const Icon = METHOD_ICONS[option.id] ?? CreditCard
                    const selected = method === option.id
                    const insufficient = option.id === 'wallet' && walletBalance < total

                    return (
                      <label
                        key={option.id}
                        className={cn(
                          'relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition',
                          selected
                            ? 'border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-500/10'
                            : 'border-ink-200 hover:border-ink-300 dark:border-white/10 dark:hover:border-white/20',
                          insufficient && 'opacity-60',
                        )}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={option.id}
                          checked={selected}
                          onChange={() => setMethod(option.id)}
                          className="sr-only"
                        />
                        <span
                          className={cn(
                            'grid size-10 shrink-0 place-items-center rounded-xl',
                            selected
                              ? 'bg-brand-600 text-white'
                              : 'bg-ink-100 text-ink-600 dark:bg-white/10 dark:text-ink-300',
                          )}
                        >
                          <Icon className="size-5" aria-hidden="true" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="text-sm font-bold">{option.label}</span>
                            {option.mode === 'offline' && (
                              <Badge tone="warning" size="sm">
                                Pay later
                              </Badge>
                            )}
                          </span>
                          <span className="mt-0.5 block text-xs text-ink-500 dark:text-ink-400">
                            {option.id === 'wallet'
                              ? `Balance ${formatCurrency(walletBalance)}${insufficient ? ' — not enough' : ''}`
                              : option.blurb}
                          </span>
                        </span>

                        {selected && (
                          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                            <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                          </span>
                        )}
                      </label>
                    )
                  })}
                </div>

                {method === 'offline' && (
                  <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                    Your tickets will be reserved and marked unpaid. Bring the exact amount — door staff settle it
                    on the scanner when you check in.
                  </p>
                )}

                {method !== 'offline' && method !== 'wallet' && (
                  <p className="mt-4 flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                    <Lock className="size-3.5 shrink-0" aria-hidden="true" />
                    You will be redirected to {PAYMENT_METHODS.find((m) => m.id === method)?.label} to authorise
                    the payment securely. Card details never touch our servers.
                  </p>
                )}
              </section>
            </div>

            {/* Order summary */}
            <aside className="min-w-0">
              <div className="sticky top-24 space-y-5">
                <div className="surface overflow-hidden">
                  <div className="flex items-start gap-3 border-b border-ink-200/70 p-5 dark:border-white/10">
                    <img src={event.cover} alt="" className="size-16 shrink-0 rounded-xl object-cover" loading="lazy" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{event.title}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-ink-500 dark:text-ink-400">
                        <CalendarDays className="size-3 shrink-0" aria-hidden="true" />
                        {formatDateRange(event.start, event.end)}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-500 dark:text-ink-400">
                        <MapPin className="size-3 shrink-0" aria-hidden="true" />
                        {event.venue ? `${event.venue.name}, ${event.venue.city}` : 'Online event'}
                      </p>
                    </div>
                  </div>

                  {/* Coupon */}
                  <div className="border-b border-ink-200/70 p-5 dark:border-white/10">
                    {coupon ? (
                      <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
                        <BadgePercent className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{coupon.code}</p>
                          <p className="truncate text-xs text-emerald-700/80 dark:text-emerald-400/80">
                            {coupon.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          aria-label="Remove coupon"
                          className="grid size-7 shrink-0 place-items-center rounded-lg text-emerald-700 transition hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <label htmlFor="coupon" className="label">
                          Have a coupon?
                        </label>
                        <div className="flex gap-2">
                          <input
                            id="coupon"
                            value={couponInput}
                            onChange={(e) => {
                              setCouponInput(e.target.value.toUpperCase())
                              setCouponError('')
                            }}
                            placeholder="WELCOME10"
                            className="field h-10 uppercase"
                          />
                          <Button type="button" onClick={onApplyCoupon} variant="outline" className="h-10 shrink-0">
                            Apply
                          </Button>
                        </div>
                        {couponError && (
                          <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{couponError}</p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Totals */}
                  <dl className="space-y-2.5 p-5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-ink-500 dark:text-ink-400">
                        Subtotal ({count} {count === 1 ? 'ticket' : 'tickets'})
                      </dt>
                      <dd className="font-semibold">{formatCurrency(subtotal)}</dd>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                        <dt>Coupon discount</dt>
                        <dd className="font-semibold">−{formatCurrency(discount)}</dd>
                      </div>
                    )}

                    {taxLines.map((line) => (
                      <div key={line.id} className="flex justify-between">
                        <dt className="text-ink-500 dark:text-ink-400">
                          {line.label} ({line.rate}%)
                        </dt>
                        <dd className="font-semibold">{formatCurrency(line.amount)}</dd>
                      </div>
                    ))}

                    <div className="flex items-baseline justify-between border-t border-ink-200/70 pt-3 dark:border-white/10">
                      <dt className="font-bold">Total</dt>
                      <dd className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">
                        {formatCurrency(total)}
                      </dd>
                    </div>
                  </dl>

                  <div className="border-t border-ink-200/70 p-5 dark:border-white/10">
                    <Checkbox
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      label="I accept the terms"
                      description="I agree to the terms of service and the organizer's refund policy."
                      className="mb-4"
                    />

                    <Button
                      type="submit"
                      fullWidth
                      size="lg"
                      loading={processing}
                      disabled={walletShort}
                      iconLeft={Lock}
                    >
                      {processing
                        ? 'Processing…'
                        : method === 'offline'
                          ? 'Reserve tickets'
                          : `Pay ${formatCurrency(total)}`}
                    </Button>

                    <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-400">
                      <ShieldCheck className="size-3.5" aria-hidden="true" />
                      Encrypted checkout · Instant QR tickets
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </form>
        </Container>
      </Section>
    </>
  )
}
