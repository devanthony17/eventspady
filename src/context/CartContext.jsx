import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useStore } from '@context/StoreContext'
import { TAXES } from '@lib/constants'

const STORAGE_KEY = 'eventspady:cart'
const CartContext = createContext(null)

const emptyCart = { eventId: null, lines: {}, coupon: null }

/**
 * A booking cart holds tickets for one event at a time — switching events
 * replaces the cart, which matches how attendees actually check out.
 */
export function CartProvider({ children }) {
  const store = useStore()
  const [cart, setCart] = useState(emptyCart)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setCart({ ...emptyCart, ...JSON.parse(raw) })
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  }, [cart, hydrated])

  const setLine = useCallback((eventId, ticketId, quantity, eventData = null) => {
    setCart((prev) => {
      // Booking a different event starts a fresh cart.
      const base = prev.eventId === eventId ? prev : { ...emptyCart, eventId, event: eventData }
      const lines = { ...base.lines }

      if (quantity > 0) lines[ticketId] = quantity
      else delete lines[ticketId]

      const isEmpty = Object.keys(lines).length === 0
      return isEmpty ? emptyCart : { ...base, eventId, event: eventData || base.event, lines }
    })
  }, [])

  /**
   * Adjusts a line by a delta rather than an absolute value, so rapid clicks
   * on a quantity stepper cannot lose an increment to a stale render.
   * `max` clamps against the ticket's per-order limit.
   */
  const addTicket = useCallback(
    (eventId, ticketId, delta = 1, max = Infinity, eventData = null) =>
      setCart((prev) => {
        const base = prev.eventId === eventId ? prev : { ...emptyCart, eventId, event: eventData }
        const next = Math.min(max, Math.max(0, (base.lines[ticketId] ?? 0) + delta))
        const lines = { ...base.lines }
        if (next > 0) lines[ticketId] = next
        else delete lines[ticketId]
        const isEmpty = Object.keys(lines).length === 0
        return isEmpty ? emptyCart : { ...base, eventId, event: eventData || base.event, lines }
      }),
    [],
  )

  const clearCart = useCallback(() => setCart(emptyCart), [])

  const applyCoupon = useCallback(
    (code) => {
      const event = cart.event || (cart.eventId ? store?.getEventById(cart.eventId) : null)
      if (!event) return { ok: false, reason: 'Add a ticket before applying a coupon.' }

      const subtotal = Object.entries(cart.lines).reduce((sum, [ticketId, qty]) => {
        const ticket = (event.tickets || []).find((t) => t.id === ticketId)
        return ticket ? sum + ticket.price * qty : sum
      }, 0)

      const result = store?.validateCoupon ? store.validateCoupon(code, { subtotal, eventId: event.id }) : { ok: true, coupon: { code }, discount: 0 }
      if (result.ok) setCart((prev) => ({ ...prev, coupon: result.coupon.code }))
      return result
    },
    [cart, store],
  )

  const removeCoupon = useCallback(() => setCart((prev) => ({ ...prev, coupon: null })), [])

  /** Fully priced cart: line items, discount, itemised tax and grand total. */
  const summary = useMemo(() => {
    const event = cart.event || (cart.eventId ? store?.getEventById(cart.eventId) : null)
    if (!event) {
      return { event: null, items: [], count: 0, subtotal: 0, discount: 0, taxLines: [], tax: 0, total: 0, coupon: null }
    }

    const items = Object.entries(cart.lines)
      .map(([ticketId, quantity]) => {
        const ticket = (event.tickets || []).find((t) => t.id === ticketId)
        if (!ticket) return null
        return { ticket, quantity, lineTotal: ticket.price * quantity }
      })
      .filter(Boolean)

    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0)
    const count = items.reduce((sum, i) => sum + i.quantity, 0)

    let discount = 0
    let coupon = null
    if (cart.coupon) {
      const result = store?.validateCoupon ? store.validateCoupon(cart.coupon, { subtotal, eventId: event.id }) : null
      if (result && result.ok) {
        discount = result.discount
        coupon = result.coupon
      }
    }

    const taxable = Math.max(0, subtotal - discount)
    const taxLines = TAXES.map((t) => ({
      ...t,
      amount: Math.round(((taxable * t.rate) / 100) * 100) / 100,
    }))
    const tax = taxLines.reduce((sum, t) => sum + t.amount, 0)

    return {
      event,
      items,
      count,
      subtotal,
      discount,
      coupon,
      taxLines,
      tax: Math.round(tax * 100) / 100,
      total: Math.round((taxable + tax) * 100) / 100,
    }
  }, [cart, store])

  const value = useMemo(
    () => ({ cart, summary, setLine, addTicket, clearCart, applyCoupon, removeCoupon }),
    [cart, summary, setLine, addTicket, clearCart, applyCoupon, removeCoupon],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
