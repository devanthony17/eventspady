/**
 * Production coupons repository — clean initial state.
 * Coupons issued by the admin or organizers in production will be populated dynamically.
 */
export const coupons = []

/**
 * Validates a coupon against the current order.
 * Returns { ok: true, discount, coupon } or { ok: false, reason }.
 */
export function validateCoupon(code, { subtotal, eventId } = {}) {
  const coupon = coupons.find((c) => c.code.toUpperCase() === String(code || '').trim().toUpperCase())

  if (!coupon) return { ok: false, reason: 'That coupon code does not exist.' }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { ok: false, reason: 'This coupon has expired.' }
  if (coupon.usageLimit && (coupon.used || 0) >= coupon.usageLimit) return { ok: false, reason: 'This coupon has reached its redemption limit.' }
  if (coupon.eventId && eventId && coupon.eventId !== eventId)
    return { ok: false, reason: 'This coupon is not valid for this event.' }
  if (coupon.minOrder && subtotal < coupon.minOrder)
    return { ok: false, reason: `Spend at least GH₵${coupon.minOrder} to use this coupon.` }

  let discount =
    coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : Math.min(coupon.value, subtotal)

  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)

  return { ok: true, discount: Math.round(discount * 100) / 100, coupon }
}
