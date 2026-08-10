import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge conditional class names, letting later Tailwind utilities win. */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)
}

export function formatDate(value, options = {}) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(new Date(value))
}

export function formatTime(value) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatDateRange(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  const sameDay = s.toDateString() === e.toDateString()
  if (sameDay) return `${formatDate(s)} · ${formatTime(s)} – ${formatTime(e)}`
  return `${formatDate(s)} – ${formatDate(e)}`
}

/** Short calendar chip, e.g. { month: 'SEP', day: '14' }. */
export function calendarChip(value) {
  const d = new Date(value)
  return {
    month: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d).toUpperCase(),
    day: new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(d),
    weekday: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d),
  }
}

export function formatCompact(n) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

/** Human countdown between now and a target date. Returns null once elapsed. */
export function countdownParts(target) {
  const diff = new Date(target).getTime() - Date.now()
  if (diff <= 0) return null
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { days, hours, minutes, seconds }
}

/** Great-circle distance in km — powers the "events near me" sort. */
export function distanceKm(a, b) {
  if (!a || !b) return null
  const toRad = (v) => (v * Math.PI) / 180
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function readingTime(text) {
  const words = String(text).trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

/** Stable pseudo-random order id, e.g. EVP-8F2K4Q. */
export function generateOrderId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return `EVP-${out}`
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}
