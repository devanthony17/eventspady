const DAY = 86400000
const inDays = (n) => new Date(Date.now() + n * DAY).toISOString()

/**
 * Coupons issued by the admin or an organizer.
 * `eventId: null` means the coupon is valid platform-wide.
 */
export const coupons = [
  {
    code: 'AKWAABA10',
    type: 'percentage',
    value: 10,
    eventId: null,
    minOrder: 0,
    maxDiscount: 60,
    expiresAt: inDays(60),
    usageLimit: 5000,
    used: 2184,
    description: '10% off your first booking, up to ₵60.',
  },
  {
    code: 'DUMBA50',
    type: 'flat',
    value: 50,
    eventId: 'evt-001',
    minOrder: 200,
    maxDiscount: null,
    expiresAt: inDays(20),
    usageLimit: 500,
    used: 287,
    description: '₵50 off Dumba Festival orders over ₵200.',
  },
  {
    code: 'JONJO15',
    type: 'percentage',
    value: 15,
    eventId: 'evt-002',
    minOrder: 50,
    maxDiscount: 50,
    expiresAt: inDays(30),
    usageLimit: 300,
    used: 231,
    description: '15% off Walk With Jonjo VIP and fitness kits.',
  },
  {
    code: 'EARLYBIRD',
    type: 'percentage',
    value: 20,
    eventId: null,
    minOrder: 150,
    maxDiscount: 100,
    expiresAt: inDays(-2),
    usageLimit: 1000,
    used: 1000,
    description: 'Expired early-bird promotion.',
  },
]

/**
 * Validates a coupon against the current order.
 * Returns { ok: true, discount, coupon } or { ok: false, reason }.
 */
export function validateCoupon(code, { subtotal, eventId }) {
  const coupon = coupons.find((c) => c.code.toUpperCase() === String(code).trim().toUpperCase())

  if (!coupon) return { ok: false, reason: 'That coupon code does not exist.' }
  if (new Date(coupon.expiresAt) < new Date()) return { ok: false, reason: 'This coupon has expired.' }
  if (coupon.used >= coupon.usageLimit) return { ok: false, reason: 'This coupon has reached its redemption limit.' }
  if (coupon.eventId && coupon.eventId !== eventId)
    return { ok: false, reason: 'This coupon is not valid for this event.' }
  if (subtotal < coupon.minOrder)
    return { ok: false, reason: `Spend at least GH₵${coupon.minOrder} to use this coupon.` }

  let discount =
    coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : Math.min(coupon.value, subtotal)

  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)

  return { ok: true, discount: Math.round(discount * 100) / 100, coupon }
}
