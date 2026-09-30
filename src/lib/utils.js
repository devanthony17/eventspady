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

/** Ghana cedis by default — `en-GH` renders the ₵ symbol rather than the code. */
export function formatCurrency(amount, currency = 'GHS') {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)
}

export function formatDate(value, options = {}) {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(new Date(value))
}

export function formatTime(value) {
  return new Intl.DateTimeFormat('en-GB', {
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
    month: new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(d).toUpperCase(),
    day: new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(d),
    weekday: new Intl.DateTimeFormat('en-GB', { weekday: 'short' }).format(d),
  }
}

export function formatCompact(n) {
  return new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
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

export const CITY_COORDINATES = {
  Wa: { lat: 10.0606, lng: -2.5057 },
  Jirapa: { lat: 10.5312, lng: -2.705 },
  Nandom: { lat: 10.8542, lng: -2.7667 },
  Wechiau: { lat: 9.7833, lng: -2.8333 },
  Sombo: { lat: 10.1587, lng: -2.5601 },
  Lawra: { lat: 10.6433, lng: -2.8167 },
  Tumu: { lat: 10.8753, lng: -1.9792 },
  Tamale: { lat: 9.4008, lng: -0.8393 },
  Bolgatanga: { lat: 10.7856, lng: -0.8514 },
  Kumasi: { lat: 6.6885, lng: -1.6244 },
  Accra: { lat: 5.6037, lng: -0.187 },
}

/** Get valid coordinates for an event, falling back to its city coordinates */
export function getEventCoordinates(event) {
  if (!event || !event.venue) return null
  const lat = Number(event.venue.lat)
  const lng = Number(event.venue.lng)
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng }
  }
  const city = event.venue.city
  if (city && CITY_COORDINATES[city]) {
    return CITY_COORDINATES[city]
  }
  // Default to Wa coordinates if in-person event
  return CITY_COORDINATES.Wa
}

/** Great-circle distance in km — powers the "events near me" sort. */
export function distanceKm(a, b) {
  if (!a || !b) return null
  const lat1 = Number(a.lat)
  const lng1 = Number(a.lng)
  const lat2 = Number(b.lat)
  const lng2 = Number(b.lng)
  if (!Number.isFinite(lat1) || !Number.isFinite(lng1) || !Number.isFinite(lat2) || !Number.isFinite(lng2)) {
    return null
  }
  const toRad = (v) => (v * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const rLat1 = toRad(lat1)
  const rLat2 = toRad(lat2)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(rLat1) * Math.cos(rLat2)
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function formatDistance(km) {
  if (km == null || !Number.isFinite(km)) return ''
  if (km < 1) return `${Math.round(km * 1000)} m away`
  if (km < 10) return `${km.toFixed(1)} km away`
  if (km < 100) return `${Math.round(km)} km away`
  return `${Math.round(km).toLocaleString()} km away`
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
