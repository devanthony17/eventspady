const DAY = 86400000
const daysAgo = (n) => new Date(Date.now() - n * DAY).toISOString()

/** The signed-in demo user. Replaced by the real session once auth is wired up. */
export const demoUser = {
  id: 'usr-001',
  name: 'Jordan Avery',
  email: 'jordan.avery@example.com',
  phone: '+1 (415) 555-0188',
  avatar: '/images/avatars/avatar-11.svg',
  role: 'attendee',
  verified: { email: true, phone: false },
  joinedAt: daysAgo(412),
  location: 'San Francisco, CA',
  walletBalance: 84.5,
  provider: 'google',
}

export const demoOrganizer = {
  id: 'usr-002',
  name: 'Nova Collective',
  email: 'team@novacollective.com',
  phone: '+1 (415) 555-0110',
  avatar: '/images/organizers/organizer-1.svg',
  role: 'organizer',
  organizerId: 'nova-collective',
  verified: { email: true, phone: true },
  joinedAt: daysAgo(2210),
  location: 'San Francisco, CA',
  walletBalance: 12480.2,
  provider: 'email',
}

/** Past and upcoming orders for the demo attendee. */
export const orders = [
  {
    id: 'EVP-7K2M9X',
    eventId: 'evt-001',
    placedAt: daysAgo(12),
    status: 'confirmed',
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    items: [{ ticketId: 'tkt-1c', name: 'All Days Pass', quantity: 2, price: 229 }],
    subtotal: 458,
    discount: 25,
    tax: 43.35,
    total: 476.35,
    attendees: [
      { name: 'Jordan Avery', email: 'jordan.avery@example.com', code: 'EVP-7K2M9X-1', checkedIn: false },
      { name: 'Sam Whitfield', email: 'sam.w@example.com', code: 'EVP-7K2M9X-2', checkedIn: false },
    ],
  },
  {
    id: 'EVP-3Q8L5T',
    eventId: 'evt-009',
    placedAt: daysAgo(5),
    status: 'confirmed',
    paymentMethod: 'wallet',
    paymentStatus: 'paid',
    items: [{ ticketId: 'tkt-9a', name: 'Live Seat', quantity: 1, price: 149 }],
    subtotal: 149,
    discount: 0,
    tax: 14.9,
    total: 163.9,
    attendees: [{ name: 'Jordan Avery', email: 'jordan.avery@example.com', code: 'EVP-3Q8L5T-1', checkedIn: false }],
  },
  {
    id: 'EVP-9B4H2N',
    eventId: 'evt-012',
    placedAt: daysAgo(2),
    status: 'confirmed',
    paymentMethod: 'offline',
    paymentStatus: 'pending',
    items: [{ ticketId: 'tkt-12a', name: 'Free Entry', quantity: 1, price: 0 }],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    attendees: [{ name: 'Jordan Avery', email: 'jordan.avery@example.com', code: 'EVP-9B4H2N-1', checkedIn: false }],
  },
  {
    id: 'EVP-5D1VED',
    eventId: 'evt-010',
    placedAt: daysAgo(96),
    status: 'completed',
    paymentMethod: 'paypal',
    paymentStatus: 'paid',
    items: [{ ticketId: 'tkt-10a', name: 'General Admission', quantity: 2, price: 19 }],
    subtotal: 38,
    discount: 0,
    tax: 3.8,
    total: 41.8,
    attendees: [
      { name: 'Jordan Avery', email: 'jordan.avery@example.com', code: 'EVP-5D1VED-1', checkedIn: true },
      { name: 'Sam Whitfield', email: 'sam.w@example.com', code: 'EVP-5D1VED-2', checkedIn: true },
    ],
  },
]

export const walletTransactions = [
  { id: 'wtx-1', type: 'debit', label: 'Product Design Masterclass', amount: 163.9, at: daysAgo(5) },
  { id: 'wtx-2', type: 'credit', label: 'Refund — Cancelled screening', amount: 24, at: daysAgo(18) },
  { id: 'wtx-3', type: 'credit', label: 'Wallet top-up', amount: 200, at: daysAgo(34) },
  { id: 'wtx-4', type: 'debit', label: 'Open Air Cinema', amount: 41.8, at: daysAgo(96) },
]

export const notifications = [
  {
    id: 'ntf-1',
    title: 'Your Nova Nights tickets are ready',
    body: 'Two All Days passes have been issued. Tap to view your QR codes.',
    at: daysAgo(12),
    read: false,
    type: 'ticket',
  },
  {
    id: 'ntf-2',
    title: 'Reminder: Community Tech Meetup starts soon',
    body: 'Doors open at 18:30 at Factory Berlin Mitte.',
    at: daysAgo(1),
    read: false,
    type: 'reminder',
  },
  {
    id: 'ntf-3',
    title: '$24 refunded to your wallet',
    body: 'Your refund for the cancelled screening has been credited.',
    at: daysAgo(18),
    read: true,
    type: 'payment',
  },
  {
    id: 'ntf-4',
    title: 'Nova Collective published a new event',
    body: 'Midnight Rooftop Sessions is now on sale.',
    at: daysAgo(21),
    read: true,
    type: 'event',
  },
]

/** Rows for the organizer panel's orders table. */
export const organizerOrders = [
  { id: 'EVP-7K2M9X', buyer: 'Jordan Avery', eventId: 'evt-001', quantity: 2, total: 476.35, method: 'stripe', status: 'paid', at: daysAgo(12) },
  { id: 'EVP-1A9C3R', buyer: 'Elena Rojas', eventId: 'evt-001', quantity: 4, total: 952.7, method: 'paypal', status: 'paid', at: daysAgo(11) },
  { id: 'EVP-6T4W8P', buyer: 'Marcus Vela', eventId: 'evt-013', quantity: 2, total: 77, method: 'razorpay', status: 'paid', at: daysAgo(9) },
  { id: 'EVP-2Z7Y1K', buyer: 'Hannah Brecht', eventId: 'evt-001', quantity: 1, total: 251.9, method: 'wallet', status: 'paid', at: daysAgo(7) },
  { id: 'EVP-8N5J0V', buyer: 'Chidi Nwosu', eventId: 'evt-013', quantity: 3, total: 115.5, method: 'offline', status: 'pending', at: daysAgo(4) },
  { id: 'EVP-4R2E6M', buyer: 'Sofia Marchetti', eventId: 'evt-001', quantity: 2, total: 503.8, method: 'flutterwave', status: 'paid', at: daysAgo(3) },
  { id: 'EVP-0X3B7L', buyer: 'Ravi Menon', eventId: 'evt-013', quantity: 1, total: 38.5, method: 'stripe', status: 'refunded', at: daysAgo(2) },
]

/** 14-day sales series powering the organizer dashboard chart. */
export const salesSeries = [
  { day: 'Mon', tickets: 42, revenue: 3820 },
  { day: 'Tue', tickets: 58, revenue: 5140 },
  { day: 'Wed', tickets: 36, revenue: 3210 },
  { day: 'Thu', tickets: 71, revenue: 6480 },
  { day: 'Fri', tickets: 96, revenue: 9120 },
  { day: 'Sat', tickets: 128, revenue: 12440 },
  { day: 'Sun', tickets: 84, revenue: 7690 },
]
