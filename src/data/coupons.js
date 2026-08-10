const DAY = 86400000
const inDays = (n) => new Date(Date.now() + n * DAY).toISOString()

/**
 * Coupons issued by the admin or an organizer.
 * `eventId: null` means the coupon is valid platform-wide.
 */
export const coupons = [
  {
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    eventId: null,
    minOrder: 0,
    maxDiscount: 40,
    expiresAt: inDays(60),
    usageLimit: 5000,
    used: 3182,
    description: '10% off your first booking, up to $40.',
  },
  {
    code: 'NOVA25',
    type: 'flat',
    value: 25,
    eventId: 'evt-001',
    minOrder: 150,
    maxDiscount: null,
    expiresAt: inDays(20),
    usageLimit: 500,
    used: 341,
    description: '$25 off Nova Nights orders over $150.',
  },
  {
    code: 'DEVCON15',
    type: 'percentage',
    value: 15,
    eventId: 'evt-002',
    minOrder: 200,
    maxDiscount: 90,
    expiresAt: inDays(30),
    usageLimit: 300,
    used: 268,
    description: '15% off StackForge DevCon tickets.',
  },
  {
    code: 'EARLYBIRD',
    type: 'percentage',
    value: 20,
    eventId: null,
    minOrder: 100,
    maxDiscount: 75,
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
    return { ok: false, reason: `Spend at least $${coupon.minOrder} to use this coupon.` }

  let discount =
    coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : Math.min(coupon.value, subtotal)

  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)

  return { ok: true, discount: Math.round(discount * 100) / 100, coupon }
}
