/** Production initial coupons: starts empty and populates dynamically from APIs or Organizer portal */
export const coupons = []

/**
 * Validates a coupon against the current order.
 * Accepts an optional couponList allowing validation against store coupons or API coupons.
 * Returns { ok: true, discount, coupon } or { ok: false, reason }.
 */
export function validateCoupon(code, { subtotal, eventId, couponList = coupons }) {
  const list = Array.isArray(couponList) ? couponList : coupons
  const coupon = list.find((c) => c.code && c.code.toUpperCase() === String(code).trim().toUpperCase())

  if (!coupon) return { ok: false, reason: 'That coupon code does not exist.' }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { ok: false, reason: 'This coupon has expired.' }
  if (coupon.usageLimit != null && coupon.used >= coupon.usageLimit) return { ok: false, reason: 'This coupon has reached its redemption limit.' }
  if (coupon.eventId && coupon.eventId !== eventId)
    return { ok: false, reason: 'This coupon is not valid for this event.' }
  if (coupon.minOrder && subtotal < coupon.minOrder)
    return { ok: false, reason: `Spend at least GH₵${coupon.minOrder} to use this coupon.` }

  let discount =
    coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : Math.min(coupon.value, subtotal)

  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)

  return { ok: true, discount: Math.round(discount * 100) / 100, coupon }
}
