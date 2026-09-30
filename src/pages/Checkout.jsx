import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  BadgePercent,
  Banknote,
  CalendarDays,
  Check,
  CheckCircle2,
  CreditCard,
  Info,
  Lock,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Ticket,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { Container, Section } from '@components/ui/Section'
import { Breadcrumbs } from '@components/ui/Breadcrumbs'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Input, Checkbox } from '@components/ui/Field'
import { Modal } from '@components/ui/Modal'
import { EmptyState } from '@components/ui/EmptyState'
import { useCart } from '@context/CartContext'
import { useAuth } from '@context/AuthContext'
import { useStore } from '@context/StoreContext'
import { useToast } from '@context/ToastContext'
import {
  useCheckoutMutation,
  useMomoPromptMutation,
  useValidateCouponMutation,
  usePaystackInitMutation,
  useFlutterwaveInitMutation,
} from '@hooks/api'
import { PAYMENT_METHODS } from '@lib/constants'
import { cn, formatCurrency, formatDateRange, generateOrderId } from '@lib/utils'

const METHOD_ICONS = {
  offline: Banknote,
  'mtn-momo': Smartphone,
  'telecel-cash': Smartphone,
  paystack: CreditCard,
  flutterwave: CreditCard,
}

export default function Checkout() {
  const { summary, setLine, addTicket, applyCoupon, removeCoupon, clearCart } = useCart()
  const { user, updateProfile, isAuthenticated } = useAuth()
  const store = useStore()
  const toast = useToast()
  const navigate = useNavigate()

  const checkoutMutation = useCheckoutMutation()
  const momoMutation = useMomoPromptMutation()
  const paystackInitMutation = usePaystackInitMutation()
  const flutterwaveInitMutation = useFlutterwaveInitMutation()
  const validateCouponMutation = useValidateCouponMutation()

  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const [method, setMethod] = useState('mtn-momo')
  const [momoPhone, setMomoPhone] = useState(user?.phone || '+233 24 418 7702')
  const [momoModalOpen, setMomoModalOpen] = useState(false)
  const [momoStep, setMomoStep] = useState('prompt')
  const [processing, setProcessing] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [buyer, setBuyer] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '+233 24 418 7702',
  })
  const [guestNames, setGuestNames] = useState({})

  useEffect(() => {
    if (user) {
      setBuyer((prev) => ({
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '+233 24 418 7702',
      }))
      if (user.phone) {
        setMomoPhone((prev) => (prev === '+233 24 418 7702' ? user.phone : prev))
      }
    }
  }, [user])

  const userEmail = buyer.email || user?.email || ''
  const gateStatus = store.getGateStatus(userEmail)
  const isGateBarred = gateStatus.barred
  const isGateFlagged = gateStatus.isFlagged

  useEffect(() => {
    if (isGateBarred && method === 'offline') {
      setMethod('mtn-momo')
      toast.warning('Pay at the gate is barred for this account due to 2 unhonored reservations.')
    }
  }, [isGateBarred, method, toast])

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

  const onApplyCoupon = async (e) => {
    e.preventDefault()
    if (!couponInput.trim()) return

    try {
      await validateCouponMutation.mutateAsync({ code: couponInput.trim(), eventId: event.id })
    } catch {
      // Non-blocking fallback
    }

    const result = applyCoupon(couponInput)
    if (result.ok) {
      setCouponError('')
      setCouponInput('')
      toast.success(`Coupon applied — you saved ${formatCurrency(result.discount)}.`)
    } else {
      setCouponError(result.reason)
    }
  }

  const finalizeOrder = async (isMomo = false) => {
    setProcessing(true)

    // Build attendees array
    let attendeeIdx = 0
    const attendees = items.flatMap((item) =>
      Array.from({ length: item.quantity }, (_, i) => {
        attendeeIdx += 1
        const isPrimary = attendeeIdx === 1
        const customName = guestNames[`guest-${attendeeIdx}`]
        return {
          name: isPrimary ? buyer.name || 'Attendee' : customName || `Guest ${attendeeIdx}`,
          email: isPrimary ? buyer.email : '',
          ticketId: item.ticket.id,
          ticketName: item.ticket.name,
          code: `EVP-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${attendeeIdx}`,
          checkedIn: false,
        }
      }),
    )

    const orderPayload = {
      eventId: event.id,
      eventSlug: event.slug,
      buyer,
      method,
      items: items.map((i) => ({ ticketId: i.ticket.id, name: i.ticket.name, quantity: i.quantity, price: i.ticket.price })),
      subtotal,
      discount,
      tax,
      total,
      couponCode: coupon?.code ?? null,
      attendees,
    }

    let placedOrder = null
    try {
      const apiRes = await checkoutMutation.mutateAsync(orderPayload)
      if (apiRes?.order) {
        placedOrder = apiRes.order
      } else if (apiRes?.id) {
        placedOrder = apiRes
      }
    } catch {
      // Non-blocking fallback
    }

    if (!placedOrder) {
      placedOrder = store.placeOrder(orderPayload)
    }

    if (isMomo && (method === 'mtn-momo' || method === 'telecel-cash')) {
      try {
        await momoMutation.mutateAsync({
          phone: momoPhone,
          amount: total,
          orderId: placedOrder.id,
          method,
        })
      } catch {
        // Non-blocking fallback
      }
    }

    // Backwards-compatible session storage
    sessionStorage.setItem('eventspady:lastOrder', JSON.stringify(placedOrder))
    clearCart()
    setProcessing(false)
    setMomoModalOpen(false)
    navigate(`/order/${placedOrder.id}`)
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!agreed) {
      toast.warning('Please accept the terms before completing your booking.')
      return
    }

    // If mobile money, open realistic prompt modal
    if (method === 'mtn-momo' || method === 'telecel-cash') {
      setMomoModalOpen(true)
      setMomoStep('prompt')
      return
    }

    if (method === 'paystack') {
      setProcessing(true)
      try {
        const initRes = await paystackInitMutation.mutateAsync({
          orderId: generateOrderId(),
          email: buyer.email,
          amount: total,
          callback_url: `${window.location.origin}/events`,
        })
        const authUrl = initRes?.authorization_url || initRes?.data?.authorization_url
        if (authUrl) {
          window.location.href = authUrl
          return
        }
      } catch {
        // Fallback to local finalize
      }
    } else if (method === 'flutterwave') {
      setProcessing(true)
      try {
        const initRes = await flutterwaveInitMutation.mutateAsync({
          orderId: generateOrderId(),
          email: buyer.email,
          amount: total,
          redirect_url: `${window.location.origin}/events`,
        })
        const link = initRes?.link || initRes?.data?.link
        if (link) {
          window.location.href = link
          return
        }
      } catch {
        // Fallback to local finalize
      }
    }

    setProcessing(true)
    await new Promise((r) => setTimeout(r, 600))
    await finalizeOrder()
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
                    placeholder="+233 24 418 7702"
                    autoComplete="tel"
                    wrapperClassName="sm:col-span-2"
                    hint="Optional — used only for urgent event updates."
                  />
                </div>
              </section>

              {/* Multi-guest names */}
              {count > 1 && (
                <section className="surface p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-600 text-sm font-extrabold text-white">
                      <Users className="size-4" />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold">Guest attendees (optional)</h2>
                      <p className="text-xs text-ink-500 dark:text-ink-400">
                        Personalize ticket stubs for your group. You can also leave these blank to assign later.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Array.from({ length: count - 1 }, (_, i) => {
                      const guestIndex = i + 2
                      const key = `guest-${guestIndex}`
                      return (
                        <Input
                          key={key}
                          label={`Ticket #${guestIndex} holder`}
                          icon={User}
                          value={guestNames[key] || ''}
                          onChange={(e) => setGuestNames({ ...guestNames, [key]: e.target.value })}
                          placeholder={`Guest ${guestIndex} full name`}
                        />
                      )
                    })}
                  </div>
                </section>
              )}

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
                    const isOptionBarred = option.id === 'offline' && isGateBarred
                    const isOptionFlagged = option.id === 'offline' && isGateFlagged
                    const selected = method === option.id && !isOptionBarred

                    return (
                      <label
                        key={option.id}
                        onClick={(e) => {
                          if (isOptionBarred) {
                            e.preventDefault()
                            toast.error('You are permanently barred from using Pay at the Gate due to 2 no-shows.')
                          }
                        }}
                        className={cn(
                          'relative flex items-start gap-3 rounded-2xl border p-4 transition',
                          isOptionBarred
                            ? 'cursor-not-allowed border-rose-300 bg-rose-50/40 opacity-70 dark:border-rose-900/40 dark:bg-rose-950/20'
                            : 'cursor-pointer',
                          selected
                            ? 'border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-500/10'
                            : !isOptionBarred
                            ? 'border-ink-200 hover:border-ink-300 dark:border-white/10 dark:hover:border-white/20'
                            : '',
                        )}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={option.id}
                          disabled={isOptionBarred}
                          checked={selected}
                          onChange={() => {
                            if (!isOptionBarred) setMethod(option.id)
                          }}
                          className="sr-only"
                        />
                        <span
                          className={cn(
                            'grid size-10 shrink-0 place-items-center rounded-xl',
                            isOptionBarred
                              ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                              : selected
                              ? 'bg-brand-600 text-white'
                              : 'bg-ink-100 text-ink-600 dark:bg-white/10 dark:text-ink-300',
                          )}
                        >
                          <Icon className="size-5" aria-hidden="true" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-1.5">
                            <span className="text-sm font-bold">{option.label}</span>
                            {option.mode === 'offline' && !isOptionBarred && !isOptionFlagged && (
                              <Badge tone="warning" size="sm">
                                Pay later
                              </Badge>
                            )}
                            {isOptionFlagged && (
                              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                ⚠️ 1 Warning
                              </span>
                            )}
                            {isOptionBarred && (
                              <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                                🚫 Barred (2 No-shows)
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block text-xs text-ink-500 dark:text-ink-400">
                            {isOptionBarred
                              ? 'Disabled — 2 unhonored event reservations on record'
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

                {/* Barred notification banner if user was barred from Pay at the Gate */}
                {isGateBarred && (
                  <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-900 dark:text-rose-200">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="size-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-rose-800 dark:text-rose-300">
                          Pay at the Gate is Barred for this Account ({userEmail})
                        </p>
                        <p className="leading-relaxed text-rose-700 dark:text-rose-200/90">
                          Our records show that you reserved tickets and refused/failed to turn up on 2 previous occasions.
                          In accordance with platform policy, you have been permanently barred from using "Pay at the gate".
                          Please complete your booking using an instant online payment method (MTN MoMo, Telecel Cash, or Card).
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* MoMo Account Prompt Details */}
                {(method === 'mtn-momo' || method === 'telecel-cash') && (
                  <div className="mt-5 rounded-2xl border border-brand-200 bg-brand-50/70 p-4 dark:border-brand-500/20 dark:bg-brand-500/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                      {method === 'mtn-momo' ? 'MTN Mobile Money' : 'Telecel Cash'} Prompt Details
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <Input
                        label="MoMo Phone Number"
                        type="tel"
                        value={momoPhone}
                        onChange={(e) => setMomoPhone(e.target.value)}
                        placeholder="024 418 7702"
                        hint="The USSD approval notification will arrive on this device."
                      />
                      <div className="flex flex-col justify-center rounded-xl bg-white/80 p-3 text-xs text-ink-600 dark:bg-white/[.04] dark:text-ink-300">
                        <p className="font-bold text-ink-900 dark:text-white flex items-center gap-1.5">
                          <Smartphone className="size-3.5 text-brand-600 dark:text-brand-400" />
                          USSD Prompt Authorization
                        </p>
                        <p className="mt-1 leading-relaxed">
                          Keep this phone unlocked. Clicking complete will trigger an approval prompt for {formatCurrency(total)}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gate Warnings & Policy Banners when Pay at Gate is selected */}
                {method === 'offline' && isGateFlagged && (
                  <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-amber-800 dark:text-amber-300">
                          ⚠️ Final Warning — 1 No-Show Strike on Record
                        </p>
                        <p className="leading-relaxed text-amber-700 dark:text-amber-200/90">
                          You previously reserved tickets and failed to turn up. This is your <strong>second and final chance</strong>.
                          If you reserve these tickets and refuse or fail to turn up to pay at the gate, you will be <strong>permanently barred</strong> from ever using Pay at the Gate again.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {method === 'offline' && !isGateFlagged && (
                  <div className="mt-5 rounded-2xl border border-amber-300/80 bg-amber-50/70 p-4 text-xs text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                    <div className="flex items-start gap-3">
                      <Info className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-amber-800 dark:text-amber-300">
                          Pay at the Gate Reservation Policy
                        </p>
                        <p className="leading-relaxed text-amber-700/90 dark:text-amber-200/80">
                          Your tickets will be reserved and marked unpaid. Bring the exact amount in cash or MoMo — door staff settle it
                          on the scanner when you check in.
                        </p>
                        <p className="pt-1 font-semibold text-amber-900 dark:text-amber-100">
                          ⚠️ Strict Policy: Attendees who reserve tickets and refuse or fail to turn up will be flagged with a warning on the 1st offense, and permanently barred from using Pay at the Gate on the 2nd offense.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {method !== 'offline' && (
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

      {/* MoMo Approval Simulation Modal */}
      <Modal
        open={momoModalOpen}
        onClose={() => !processing && setMomoModalOpen(false)}
        title="Approve Mobile Money Payment"
        description={`Authorize payment of ${formatCurrency(total)} via ${method === 'mtn-momo' ? 'MTN MoMo' : 'Telecel Cash'}.`}
        size="md"
      >
        <div className="space-y-5 py-2 text-center">
          <div className="relative mx-auto grid size-20 place-items-center rounded-3xl bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
            <Smartphone className="size-10" />
            <span className="absolute -top-1 -right-1 flex size-4">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-4 rounded-full bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold">Check your phone</h3>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
              A USSD prompt has been sent to{' '}
              <span className="font-mono font-bold text-ink-900 dark:text-white">{momoPhone}</span>.
              Please approve the transaction by entering your PIN.
            </p>
          </div>

          <div className="space-y-1.5 rounded-2xl border border-ink-200/70 bg-ink-50 p-4 text-left text-xs text-ink-600 dark:border-white/10 dark:bg-white/[.04] dark:text-ink-300">
            <div className="flex justify-between font-medium">
              <span>Merchant:</span>
              <span className="font-bold text-ink-900 dark:text-white">Eventspady Limited</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Event:</span>
              <span className="max-w-[200px] truncate font-bold text-ink-900 dark:text-white">{event.title}</span>
            </div>
            <div className="flex justify-between border-t border-ink-200 pt-1.5 font-medium dark:border-white/10">
              <span>Amount due:</span>
              <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              onClick={() => finalizeOrder(true)}
              loading={processing}
              size="lg"
              fullWidth
              iconLeft={CheckCircle2}
            >
              Simulate PIN Approval & Confirm
            </Button>
            <Button
              variant="ghost"
              disabled={processing}
              onClick={() => setMomoModalOpen(false)}
              size="sm"
            >
              Cancel transaction
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
