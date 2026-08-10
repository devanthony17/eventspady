export const SITE = {
  name: 'Eventspady',
  tagline: 'Discover, book and manage unforgettable events',
  description:
    'Eventspady is a premium event booking and management platform. Create listings, sell tickets, process payments, scan QR check-ins and manage guests — all in one place.',
  url: 'https://eventspady.com',
  email: 'hello@eventspady.com',
  phone: '+1 (415) 555-0142',
  address: '2140 Market Street, Suite 400, San Francisco, CA',
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

export const PAYMENT_METHODS = [
  { id: 'stripe', label: 'Stripe', blurb: 'Card, Apple Pay & Google Pay', mode: 'online' },
  { id: 'paypal', label: 'PayPal', blurb: 'Pay with your PayPal balance', mode: 'online' },
  { id: 'flutterwave', label: 'Flutterwave', blurb: 'Cards & mobile money across Africa', mode: 'online' },
  { id: 'razorpay', label: 'Razorpay', blurb: 'UPI, netbanking & wallets', mode: 'online' },
  { id: 'wallet', label: 'Eventspady Wallet', blurb: 'Use your available balance', mode: 'online' },
  { id: 'offline', label: 'Pay at the venue', blurb: 'Cash while checking in', mode: 'offline' },
]

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
]

export const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'NGN', symbol: '₦' },
  { code: 'INR', symbol: '₹' },
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

/** Platform-wide taxes, mirroring the admin Tax page. */
export const TAXES = [
  { id: 'vat', label: 'VAT', rate: 7.5 },
  { id: 'service', label: 'Service fee', rate: 2.5 },
]
