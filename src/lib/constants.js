export const SITE = {
  name: 'Eventspady',
  tagline: 'Discover, book and manage unforgettable events in Wa',
  description:
    'Eventspady is the event booking and management platform for Wa and the Upper West Region. Create listings, sell tickets, take mobile money, scan QR check-ins and manage guests — all in one place.',
  url: 'https://eventspady.com',
  email: 'hello@eventspady.com',
  phone: '+233 (0) 39 209 1420',
  address: 'Dobile Junction, Wa, Upper West Region, Ghana',
  region: 'Upper West Region',
  city: 'Wa',
  country: 'Ghana',
  ogImage: '/images/og-image.svg',
  social: {
    twitter: 'https://twitter.com/eventspady',
    facebook: 'https://facebook.com/eventspady',
    instagram: 'https://instagram.com/eventspady',
    linkedin: 'https://linkedin.com/company/eventspady',
    youtube: 'https://youtube.com/@eventspady',
  },
}

/** Ticket types supported by the platform. */
export const TICKET_TYPES = {
  free: { label: 'Free', description: 'No charge — registration only' },
  paid: { label: 'Paid', description: 'Standard priced ticket' },
  oneDay: { label: 'One Day', description: 'Valid for a single chosen day' },
  allDay: { label: 'All Days', description: 'Valid for every day of the event' },
}

export const EVENT_TYPES = {
  venue: { label: 'Venue', description: 'In-person event at a physical location' },
  online: { label: 'Online', description: 'Streamed event with a join link' },
}

/** Channels that matter in Ghana — mobile money first, then cards, then cash. */
export const PAYMENT_METHODS = [
  { id: 'mtn-momo', label: 'MTN Mobile Money', blurb: 'Pay with your MoMo phone number', mode: 'online' },
  { id: 'telecel-cash', label: 'Telecel Cash', blurb: 'Formerly Vodafone Cash', mode: 'online' },
  { id: 'paystack', label: 'Paystack', blurb: 'Cards, bank transfer & MoMo', mode: 'online' },
  { id: 'flutterwave', label: 'Flutterwave', blurb: 'Cards & mobile money across Africa', mode: 'online' },
  { id: 'offline', label: 'Pay at the gate', blurb: 'Reserve now, pay cash or MoMo upon arrival at venue', mode: 'offline' },
]

/** English plus the languages actually spoken across the Upper West. */
export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇭' },
  { code: 'dag', label: 'Dagaare', flag: '🇬🇭' },
  { code: 'wal', label: 'Waali', flag: '🇬🇭' },
  { code: 'sis', label: 'Sisaali', flag: '🇬🇭' },
  { code: 'tw', label: 'Twi', flag: '🇬🇭' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
]

export const CURRENCIES = [
  { code: 'GHS', symbol: '₵' },
  { code: 'NGN', symbol: '₦' },
  { code: 'XOF', symbol: 'CFA' },
  { code: 'USD', symbol: '$' },
  { code: 'GBP', symbol: '£' },
]

/** Reasons offered when a user reports an event to the admin. */
export const REPORT_REASONS = [
  'Misleading or false information',
  'Inappropriate or offensive content',
  'Suspected scam or fraud',
  'Duplicate listing',
  'Event has been cancelled',
  'Copyright infringement',
  'Other',
]

export const COMMISSION = { type: 'percentage', value: 6 }

/** Ghana Revenue Authority levies applied on top of the ticket price. */
export const TAXES = [
  { id: 'vat', label: 'VAT', rate: 15 },
  { id: 'nhil', label: 'NHIL & GETFund', rate: 5 },
]
