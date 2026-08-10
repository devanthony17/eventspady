import { getOrganizer } from '@data/organizers'
import { getCategory } from '@data/categories'

/** Dates are relative to load time so the catalogue never goes stale. */
const DAY = 86400000
function at(daysFromNow, hour = 10, minute = 0) {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return new Date(d.getTime() + daysFromNow * DAY).toISOString()
}

/**
 * Fills derived fields the UI relies on so consumers never recompute them:
 * price range, availability, sold-out state and the resolved organizer.
 */
function makeEvent(event) {
  const tickets = event.tickets.map((t) => ({
    currency: 'USD',
    perOrderLimit: 10,
    sold: 0,
    ...t,
    remaining: Math.max(0, t.quantity - (t.sold ?? 0)),
  }))

  // Price range reflects what a visitor can actually buy, so a sold-out free
  // tier never advertises the event as "From $0".
  const now = Date.now()
  const purchasable = tickets.filter((t) => t.remaining > 0 && new Date(t.salesEnd).getTime() > now)
  const prices = (purchasable.length > 0 ? purchasable : tickets).map((t) => t.price)

  const capacity = tickets.reduce((sum, t) => sum + t.quantity, 0)
  const sold = tickets.reduce((sum, t) => sum + t.sold, 0)

  return {
    currency: 'USD',
    gallery: [],
    tags: [],
    featured: false,
    trending: false,
    ageLimit: 'All ages',
    ...event,
    tickets,
    priceFrom: Math.min(...prices),
    priceTo: Math.max(...prices),
    isFree: prices.every((p) => p === 0),
    capacity,
    sold,
    remaining: capacity - sold,
    soldOut: capacity - sold <= 0,
    get organizer() {
      return getOrganizer(event.organizerId)
    },
    get categoryMeta() {
      return getCategory(event.category)
    },
  }
}

export const events = [
  makeEvent({
    id: 'evt-001',
    slug: 'nova-nights-summer-festival',
    title: 'Nova Nights: Summer Festival',
    tagline: 'Three days. Four stages. One unforgettable skyline.',
    category: 'music',
    tags: ['festival', 'live music', 'outdoor', 'electronic'],
    type: 'venue',
    cover: '/images/events/event-1.svg',
    gallery: ['/images/gallery/gallery-1.svg', '/images/gallery/gallery-2.svg', '/images/gallery/gallery-3.svg'],
    start: at(24, 16, 0),
    end: at(26, 23, 30),
    organizerId: 'nova-collective',
    featured: true,
    trending: true,
    rating: 4.9,
    reviewsCount: 1284,
    views: 48200,
    ageLimit: '18+',
    venue: {
      name: 'Pier 70 Waterfront',
      address: '420 22nd Street, San Francisco, CA 94107',
      city: 'San Francisco',
      country: 'United States',
      lat: 37.7576,
      lng: -122.3872,
    },
    description: [
      'Nova Nights returns to the San Francisco waterfront for its seventh edition — three days of live music spread across four stages, with the bay and the city skyline as the backdrop.',
      'This year’s line-up spans headline electronic acts, live bands and a late-night warehouse stage curated by Nova Collective residents. Between sets, wander the maker’s market, the independent food village and a full-scale light installation from Lumen Arts.',
      'All-day tickets grant access to every stage on every day, while one-day passes let you pick the day that suits you. Under-18s are not admitted; valid photo ID is required at the gate.',
    ],
    highlights: [
      '4 stages with 60+ artists across three days',
      'Independent food village with 20 local vendors',
      'Free re-entry all weekend with an All Days pass',
      'Cashless payments on site via the Eventspady wallet',
    ],
    tickets: [
      { id: 'tkt-1a', name: 'Day Pass — Friday', type: 'oneDay', price: 89, quantity: 2500, sold: 2180, description: 'Access to all stages on Friday only.', salesEnd: at(23) },
      { id: 'tkt-1b', name: 'Day Pass — Saturday', type: 'oneDay', price: 99, quantity: 2500, sold: 2410, description: 'Access to all stages on Saturday only.', salesEnd: at(24) },
      { id: 'tkt-1c', name: 'All Days Pass', type: 'allDay', price: 229, quantity: 3000, sold: 2140, description: 'Every stage, all three days, with free re-entry.', salesEnd: at(23), popular: true },
      { id: 'tkt-1d', name: 'VIP All Days', type: 'allDay', price: 449, quantity: 400, sold: 356, description: 'Raised viewing deck, private bar and express entry.', salesEnd: at(23) },
    ],
    schedule: [
      {
        day: 'Day 1 — Friday',
        date: at(24),
        items: [
          { time: '16:00', title: 'Gates open', description: 'Security check, wristband exchange and market access.' },
          { time: '17:30', title: 'Opening set — Kaia Lune', speaker: 'Main Stage' },
          { time: '20:00', title: 'Sunset showcase — The Vellum', speaker: 'Bay Stage' },
          { time: '22:15', title: 'Headline — ARCWAVE', speaker: 'Main Stage' },
        ],
      },
      {
        day: 'Day 2 — Saturday',
        date: at(25),
        items: [
          { time: '15:00', title: 'Gates open' },
          { time: '16:30', title: 'Live band series', speaker: 'Garden Stage' },
          { time: '21:00', title: 'Headline — Nocturne Bloom', speaker: 'Main Stage' },
          { time: '23:30', title: 'Warehouse after-hours', speaker: 'Dock 9' },
        ],
      },
      {
        day: 'Day 3 — Sunday',
        date: at(26),
        items: [
          { time: '14:00', title: 'Gates open' },
          { time: '16:00', title: 'Acoustic sessions', speaker: 'Garden Stage' },
          { time: '20:45', title: 'Closing ceremony & light show', speaker: 'Main Stage' },
        ],
      },
    ],
    faq: [
      { q: 'Is re-entry allowed?', a: 'All Days and VIP ticket holders may leave and re-enter freely. Day Pass holders get one re-entry per day.' },
      { q: 'What can I bring?', a: 'Sealed water bottles up to 500ml, small bags under 30x30cm and portable chargers. No professional cameras or glass.' },
      { q: 'Is the site accessible?', a: 'Yes — step-free routes, an accessible viewing platform at the Main Stage and accessible toilets on every field.' },
    ],
  }),

  makeEvent({
    id: 'evt-002',
    slug: 'stackforge-devcon-2026',
    title: 'StackForge DevCon 2026',
    tagline: 'The conference for engineers building at scale.',
    category: 'technology',
    tags: ['conference', 'engineering', 'platform', 'devops'],
    type: 'venue',
    cover: '/images/events/event-2.svg',
    gallery: ['/images/gallery/gallery-4.svg', '/images/gallery/gallery-5.svg'],
    start: at(38, 9, 0),
    end: at(39, 18, 0),
    organizerId: 'stackforge',
    featured: true,
    trending: true,
    rating: 4.8,
    reviewsCount: 942,
    views: 31600,
    venue: {
      name: 'Station Berlin — Halle 4',
      address: 'Luckenwalder Str. 4-6, 10963 Berlin',
      city: 'Berlin',
      country: 'Germany',
      lat: 52.4986,
      lng: 13.3785,
    },
    description: [
      'DevCon brings together 2,000 engineers for two days of deep technical talks on distributed systems, developer platforms and the operational realities of running software at scale.',
      'Expect no vendor keynotes and no product pitches — every session is a working engineer talking about something they actually shipped, including the parts that went wrong.',
      'Day two is entirely hands-on: eight parallel workshop tracks, capped at 40 seats each, running from architecture reviews to incident-response game days.',
    ],
    highlights: [
      '48 talks across 3 tracks, all recorded and shared with attendees',
      'Hands-on workshop day with 8 parallel tracks',
      'Hallway track with dedicated office-hours booths',
      'Ticket includes lunch, coffee and the Thursday social',
    ],
    tickets: [
      { id: 'tkt-2a', name: 'Conference — Day 1', type: 'oneDay', price: 249, quantity: 900, sold: 742, description: 'All talks on day one, lunch included.', salesEnd: at(37) },
      { id: 'tkt-2b', name: 'Full Conference', type: 'allDay', price: 429, quantity: 1100, sold: 934, description: 'Talks plus a reserved workshop seat.', salesEnd: at(37), popular: true },
      { id: 'tkt-2c', name: 'Team Pass (5 seats)', type: 'allDay', price: 1795, quantity: 120, sold: 71, description: 'Five full-conference seats with shared invoicing.', perOrderLimit: 3, salesEnd: at(35) },
    ],
    schedule: [
      {
        day: 'Day 1 — Talks',
        date: at(38),
        items: [
          { time: '09:00', title: 'Registration & coffee' },
          { time: '10:00', title: 'Keynote: The platform is the product', speaker: 'Ada Ferreira' },
          { time: '11:30', title: 'Rebuilding our scheduler without downtime', speaker: 'Ilya Novak' },
          { time: '14:00', title: 'Observability past the dashboards', speaker: 'Marisol Reyes' },
          { time: '16:30', title: 'Panel: hiring and growing platform teams' },
          { time: '19:00', title: 'Attendee social — Halle 2' },
        ],
      },
      {
        day: 'Day 2 — Workshops',
        date: at(39),
        items: [
          { time: '09:30', title: 'Workshop block A', description: 'Kubernetes cost tuning · Postgres at scale · Event-driven design' },
          { time: '13:30', title: 'Workshop block B', description: 'Incident game day · CI pipeline surgery · Load-testing clinic' },
          { time: '17:00', title: 'Closing remarks & raffle' },
        ],
      },
    ],
    faq: [
      { q: 'Are talks recorded?', a: 'Yes. Every talk is recorded and released to ticket holders within two weeks.' },
      { q: 'Can I swap my workshop?', a: 'Workshop seats can be swapped from your dashboard up to 48 hours before the event, subject to availability.' },
      { q: 'Do you provide invoices?', a: 'A VAT invoice is generated automatically and available from your order page.' },
    ],
  }),

  makeEvent({
    id: 'evt-003',
    slug: 'founders-roundtable-scaling-to-series-b',
    title: 'Founders Roundtable: Scaling to Series B',
    tagline: 'A closed-door session with operators who have done it.',
    category: 'business',
    tags: ['startup', 'fundraising', 'networking'],
    type: 'online',
    cover: '/images/events/event-3.svg',
    start: at(9, 17, 0),
    end: at(9, 19, 0),
    organizerId: 'atlas-ventures',
    featured: false,
    trending: true,
    rating: 4.7,
    reviewsCount: 216,
    views: 12400,
    online: { platform: 'Eventspady Live', joinNote: 'A private join link is attached to your ticket and emailed 1 hour before the session.' },
    description: [
      'A two-hour, off-the-record roundtable for founders preparing a Series B raise within the next twelve months.',
      'Three operators who have recently closed rounds walk through their real metrics, deck iterations and the questions that caught them off guard in partner meetings.',
      'Attendance is capped at 60 so every participant can ask questions. The session is not recorded.',
    ],
    highlights: [
      'Capped at 60 founders for genuine Q&A',
      'Real decks and real metrics, shared off the record',
      'Follow-up intro list circulated to attendees',
      'Not recorded — speak freely',
    ],
    tickets: [
      { id: 'tkt-3a', name: 'Founder Seat', type: 'paid', price: 75, quantity: 60, sold: 47, description: 'One seat in the live roundtable.', perOrderLimit: 2, salesEnd: at(9) },
    ],
    schedule: [
      {
        day: 'Session',
        date: at(9),
        items: [
          { time: '17:00', title: 'Welcome & intros' },
          { time: '17:20', title: 'Three raise stories, told honestly' },
          { time: '18:15', title: 'Open Q&A' },
          { time: '18:50', title: 'Intro swap & close' },
        ],
      },
    ],
    faq: [
      { q: 'Will it be recorded?', a: 'No. The session is deliberately off the record so speakers can share candid numbers.' },
      { q: 'Who should attend?', a: 'Founders and senior operators at companies that have raised a Series A and are planning a B.' },
    ],
  }),

  makeEvent({
    id: 'evt-004',
    slug: 'harvest-table-chefs-dinner',
    title: 'Harvest Table: A Chef’s Dinner',
    tagline: 'Seven courses, one long table, zero pretension.',
    category: 'food-drink',
    tags: ['dinner', 'wine', 'tasting menu'],
    type: 'venue',
    cover: '/images/events/event-4.svg',
    gallery: ['/images/gallery/gallery-6.svg', '/images/gallery/gallery-1.svg'],
    start: at(14, 19, 30),
    end: at(14, 23, 0),
    organizerId: 'the-tasting-room',
    featured: true,
    trending: false,
    rating: 4.9,
    reviewsCount: 431,
    views: 9800,
    ageLimit: '18+',
    venue: {
      name: 'Estufa Fria Glasshouse',
      address: 'Parque Eduardo VII, 1070-051 Lisboa',
      city: 'Lisbon',
      country: 'Portugal',
      lat: 38.7304,
      lng: -9.1533,
    },
    description: [
      'One long table set inside Lisbon’s glasshouse, forty guests, and a seven-course menu built entirely from what the market had that morning.',
      'Chef Rita Salgado cooks in the open, explains each course as it lands, and pairs every plate with a natural wine chosen by our sommelier.',
      'Dietary requirements are accommodated with advance notice — add them at checkout and the kitchen will plan around them.',
    ],
    highlights: [
      'Seven courses with natural wine pairing',
      'Only 40 seats at one shared table',
      'Menu written the morning of the dinner',
      'Vegetarian and vegan menus available on request',
    ],
    tickets: [
      { id: 'tkt-4a', name: 'Seat at the Table', type: 'paid', price: 145, quantity: 40, sold: 34, description: 'Seven courses with wine pairing.', perOrderLimit: 4, salesEnd: at(13), popular: true },
      { id: 'tkt-4b', name: 'Seat — No Alcohol', type: 'paid', price: 110, quantity: 10, sold: 6, description: 'Seven courses with a non-alcoholic pairing.', perOrderLimit: 4, salesEnd: at(13) },
    ],
    schedule: [
      {
        day: 'Dinner',
        date: at(14),
        items: [
          { time: '19:30', title: 'Arrival & welcome pour' },
          { time: '20:00', title: 'Courses one to three' },
          { time: '21:15', title: 'Kitchen interlude', description: 'Rita talks through the market run.' },
          { time: '21:40', title: 'Courses four to seven' },
          { time: '22:45', title: 'Coffee & petit fours' },
        ],
      },
    ],
    faq: [
      { q: 'Can you cater for allergies?', a: 'Yes — note them at checkout at least 72 hours ahead and the kitchen will adapt your courses.' },
      { q: 'Is the seating assigned?', a: 'Seats are assigned on the night. Groups booked on one order are always seated together.' },
    ],
  }),

  makeEvent({
    id: 'evt-005',
    slug: 'summit-trail-half-marathon',
    title: 'Summit Trail Half Marathon',
    tagline: '21km of switchbacks, ridgelines and very good views.',
    category: 'sports',
    tags: ['running', 'trail', 'outdoor', 'race'],
    type: 'venue',
    cover: '/images/events/event-5.svg',
    start: at(31, 7, 0),
    end: at(31, 14, 0),
    organizerId: 'peak-athletics',
    trending: true,
    rating: 4.6,
    reviewsCount: 388,
    views: 15200,
    venue: {
      name: 'Chautauqua Trailhead',
      address: '900 Baseline Rd, Boulder, CO 80302',
      city: 'Boulder',
      country: 'United States',
      lat: 39.9986,
      lng: -105.2811,
    },
    description: [
      'A genuine mountain half marathon: 21.1km with 980m of climbing, three aid stations and a finish line back at the trailhead meadow.',
      'The course is fully marked and marshalled, with a seven-hour cut-off so hikers and first-timers are welcome alongside the front of the pack.',
      'Entry includes chip timing, a finisher medal, post-race breakfast and a shuttle from the downtown parking structure.',
    ],
    highlights: [
      '21.1km · 980m elevation gain · 7-hour cut-off',
      'Chip timing with live tracking for supporters',
      'Three aid stations with water, electrolytes and fuel',
      'Shuttle service from downtown Boulder included',
    ],
    tickets: [
      { id: 'tkt-5a', name: 'Half Marathon Entry', type: 'paid', price: 68, quantity: 800, sold: 623, description: 'Chip-timed entry, medal and post-race breakfast.', perOrderLimit: 4, salesEnd: at(29), popular: true },
      { id: 'tkt-5b', name: '10K Entry', type: 'paid', price: 42, quantity: 400, sold: 288, description: 'Shorter loop on the same course.', perOrderLimit: 4, salesEnd: at(29) },
      { id: 'tkt-5c', name: 'Supporter Pass', type: 'free', price: 0, quantity: 600, sold: 214, description: 'Access to the finish festival and breakfast tent.', perOrderLimit: 6, salesEnd: at(30) },
    ],
    schedule: [
      {
        day: 'Race day',
        date: at(31),
        items: [
          { time: '06:00', title: 'Bib collection opens' },
          { time: '07:00', title: 'Half marathon start' },
          { time: '07:30', title: '10K start' },
          { time: '10:00', title: 'First finishers expected' },
          { time: '13:00', title: 'Awards ceremony' },
        ],
      },
    ],
    faq: [
      { q: 'Is there a cut-off?', a: 'Yes — seven hours from the gun. Sweepers follow the final runner.' },
      { q: 'Can I transfer my entry?', a: 'Entries can be transferred to another runner from your dashboard up to 7 days before race day.' },
    ],
  }),

  makeEvent({
    id: 'evt-006',
    slug: 'lumen-after-dark-light-installation',
    title: 'Lumen After Dark',
    tagline: 'An immersive light installation across four galleries.',
    category: 'arts',
    tags: ['immersive', 'installation', 'exhibition'],
    type: 'venue',
    cover: '/images/events/event-6.svg',
    gallery: ['/images/gallery/gallery-2.svg', '/images/gallery/gallery-5.svg'],
    start: at(5, 18, 0),
    end: at(19, 22, 0),
    organizerId: 'lumen-arts',
    featured: true,
    rating: 4.8,
    reviewsCount: 527,
    views: 22900,
    venue: {
      name: 'The Old Selfridges Hotel',
      address: '1 Orchard St, London W1H 6JS',
      city: 'London',
      country: 'United Kingdom',
      lat: 51.5145,
      lng: -0.1527,
    },
    description: [
      'Four galleries, each given over to a single artist working with light, sound and scale. Visitors move through at their own pace across roughly 70 minutes.',
      'Entry is by timed slot to keep the rooms uncrowded — pick your arrival window when you book, and arrive within 15 minutes of it.',
      'The installation runs for two weeks with late openings every Thursday through Saturday.',
    ],
    highlights: [
      'Four commissioned installations across 1,400m²',
      'Timed entry so rooms never feel crowded',
      'Late openings Thursday to Saturday',
      'Step-free access throughout',
    ],
    tickets: [
      { id: 'tkt-6a', name: 'Standard Entry', type: 'oneDay', price: 24, quantity: 6000, sold: 4120, description: 'Timed entry slot for one visitor.', perOrderLimit: 8, salesEnd: at(18), popular: true },
      { id: 'tkt-6b', name: 'Concession', type: 'oneDay', price: 16, quantity: 1500, sold: 890, description: 'Students, seniors and under-16s with valid ID.', perOrderLimit: 8, salesEnd: at(18) },
      { id: 'tkt-6c', name: 'Members Preview', type: 'free', price: 0, quantity: 300, sold: 300, description: 'Free preview evening for Lumen members.', perOrderLimit: 2, salesEnd: at(4) },
    ],
    schedule: [
      {
        day: 'Daily programme',
        date: at(5),
        items: [
          { time: '18:00', title: 'First entry slot' },
          { time: '19:00', title: 'Artist walk-through', description: 'Thursdays only, included with entry.' },
          { time: '21:00', title: 'Final entry slot' },
          { time: '22:00', title: 'Galleries close' },
        ],
      },
    ],
    faq: [
      { q: 'How long does a visit take?', a: 'Most visitors spend 60–80 minutes. There is no time limit once you are inside.' },
      { q: 'Is it suitable for children?', a: 'Yes, though two rooms use strobing light. Under-12s must be accompanied.' },
    ],
  }),

  makeEvent({
    id: 'evt-007',
    slug: 'reset-weekend-breathwork-retreat',
    title: 'Reset Weekend: Breathwork Retreat',
    tagline: 'Two days offline, in the hills, with your phone in a box.',
    category: 'health',
    tags: ['retreat', 'wellness', 'breathwork', 'meditation'],
    type: 'venue',
    cover: '/images/events/event-7.svg',
    start: at(47, 15, 0),
    end: at(49, 12, 0),
    organizerId: 'mindful-co',
    rating: 4.9,
    reviewsCount: 703,
    views: 8600,
    venue: {
      name: 'Ubud Ridge Retreat',
      address: 'Jl. Raya Sanggingan, Ubud, Bali 80571',
      city: 'Ubud',
      country: 'Indonesia',
      lat: -8.4995,
      lng: 115.2533,
    },
    description: [
      'A deliberately unhurried weekend: guided breathwork twice daily, long silent walks, plant-based meals and absolutely no schedule pressure.',
      'Phones go into a box on arrival. You get them back at any point you ask — but almost nobody does before Sunday.',
      'Accommodation for two nights, all meals and every session are included in the ticket price.',
    ],
    highlights: [
      'Two nights’ accommodation and all meals included',
      'Four guided breathwork sessions with certified facilitators',
      'Group capped at 24 people',
      'Plant-based menu prepared on site',
    ],
    tickets: [
      { id: 'tkt-7a', name: 'Shared Room', type: 'allDay', price: 385, quantity: 16, sold: 12, description: 'Twin-share room, all meals and sessions.', perOrderLimit: 2, salesEnd: at(40) },
      { id: 'tkt-7b', name: 'Private Room', type: 'allDay', price: 610, quantity: 8, sold: 5, description: 'Private room with garden terrace.', perOrderLimit: 2, salesEnd: at(40), popular: true },
    ],
    schedule: [
      {
        day: 'Friday',
        date: at(47),
        items: [
          { time: '15:00', title: 'Arrival & phone drop' },
          { time: '17:00', title: 'Opening circle' },
          { time: '19:00', title: 'Dinner' },
        ],
      },
      {
        day: 'Saturday',
        date: at(48),
        items: [
          { time: '07:00', title: 'Morning breathwork' },
          { time: '10:00', title: 'Silent ridge walk' },
          { time: '16:00', title: 'Afternoon session' },
          { time: '20:00', title: 'Fire circle' },
        ],
      },
      {
        day: 'Sunday',
        date: at(49),
        items: [
          { time: '07:30', title: 'Closing breathwork' },
          { time: '10:00', title: 'Brunch & integration' },
          { time: '12:00', title: 'Departure' },
        ],
      },
    ],
    faq: [
      { q: 'Do I need experience?', a: 'None at all. Sessions are guided from first principles and facilitators adjust to the room.' },
      { q: 'What if I need my phone?', a: 'You can retrieve it any time. We simply ask that calls are taken away from shared spaces.' },
    ],
  }),

  makeEvent({
    id: 'evt-008',
    slug: 'clutch-invitational-grand-finals',
    title: 'Clutch Invitational — Grand Finals',
    tagline: 'Eight teams. One arena. A very loud Sunday.',
    category: 'gaming',
    tags: ['esports', 'tournament', 'finals'],
    type: 'venue',
    cover: '/images/events/event-8.svg',
    gallery: ['/images/gallery/gallery-3.svg', '/images/gallery/gallery-4.svg'],
    start: at(18, 12, 0),
    end: at(18, 22, 0),
    organizerId: 'clutch-esports',
    trending: true,
    featured: true,
    rating: 4.7,
    reviewsCount: 1120,
    views: 63400,
    venue: {
      name: 'Jamsil Arena',
      address: '25 Olympic-ro, Songpa-gu, Seoul',
      city: 'Seoul',
      country: 'South Korea',
      lat: 37.5127,
      lng: 127.0719,
    },
    description: [
      'The season closes with eight qualified teams playing down to a single champion across a ten-hour broadcast day.',
      'Floor seats put you inside the pit with the desk and the stage; tiered seating gives you the full arena view and the light show.',
      'Doors open ninety minutes before the first map for the fan zone, merch drops and creator meet-and-greets.',
    ],
    highlights: [
      'Eight teams, best-of-five grand final',
      'Fan zone with creator meet-and-greets',
      'Exclusive merch drop for attendees',
      'Full broadcast production with live desk',
    ],
    tickets: [
      { id: 'tkt-8a', name: 'Tiered Seating', type: 'oneDay', price: 55, quantity: 8000, sold: 7420, description: 'Reserved seat in the upper and mid tiers.', salesEnd: at(17) },
      { id: 'tkt-8b', name: 'Floor Seat', type: 'oneDay', price: 130, quantity: 1200, sold: 1150, description: 'Pit-level seating close to the stage.', salesEnd: at(17), popular: true },
      { id: 'tkt-8c', name: 'Champion Package', type: 'oneDay', price: 340, quantity: 200, sold: 200, description: 'Floor seat, merch bundle and a backstage tour.', perOrderLimit: 2, salesEnd: at(16) },
    ],
    schedule: [
      {
        day: 'Finals day',
        date: at(18),
        items: [
          { time: '10:30', title: 'Doors & fan zone open' },
          { time: '12:00', title: 'Quarter-finals' },
          { time: '15:30', title: 'Semi-finals' },
          { time: '18:30', title: 'Creator showmatch' },
          { time: '19:30', title: 'Grand final — best of five' },
          { time: '21:45', title: 'Trophy presentation' },
        ],
      },
    ],
    faq: [
      { q: 'Can I bring a camera?', a: 'Phones and compact cameras are fine. Detachable-lens cameras require a media pass.' },
      { q: 'Are seats reserved?', a: 'Yes, every ticket carries a specific seat printed on your QR ticket.' },
    ],
  }),

  makeEvent({
    id: 'evt-009',
    slug: 'product-design-masterclass-online',
    title: 'Product Design Masterclass',
    tagline: 'From research signal to shipped interface, in one day.',
    category: 'education',
    tags: ['design', 'workshop', 'ux', 'online'],
    type: 'online',
    cover: '/images/events/event-9.svg',
    start: at(12, 13, 0),
    end: at(12, 18, 0),
    organizerId: 'stackforge',
    rating: 4.8,
    reviewsCount: 289,
    views: 11200,
    online: { platform: 'Eventspady Live', joinNote: 'Join link and workshop files are attached to your ticket.' },
    description: [
      'A five-hour live masterclass covering the full arc of a product design cycle — framing the problem, running lean research, and turning findings into interface decisions you can defend.',
      'You work along in Figma throughout using a supplied starter file. Two facilitators review work in breakout rooms during each exercise.',
      'The recording and all workshop materials stay available to you for twelve months.',
    ],
    highlights: [
      'Live, hands-on — you leave with finished work',
      'Figma starter file and component kit included',
      'Breakout reviews with two facilitators',
      '12 months of access to the recording',
    ],
    tickets: [
      { id: 'tkt-9a', name: 'Live Seat', type: 'paid', price: 149, quantity: 200, sold: 138, description: 'Live attendance, materials and recording.', perOrderLimit: 5, salesEnd: at(12), popular: true },
      { id: 'tkt-9b', name: 'Recording Only', type: 'paid', price: 59, quantity: 500, sold: 202, description: 'Recording and materials, no live attendance.', perOrderLimit: 5, salesEnd: at(14) },
    ],
    schedule: [
      {
        day: 'Masterclass',
        date: at(12),
        items: [
          { time: '13:00', title: 'Framing the problem' },
          { time: '14:15', title: 'Exercise: research synthesis' },
          { time: '15:30', title: 'From insight to interface' },
          { time: '16:45', title: 'Exercise: critique round' },
          { time: '17:40', title: 'Q&A and wrap' },
        ],
      },
    ],
    faq: [
      { q: 'Do I need Figma?', a: 'A free Figma account is enough. The starter file is shared 24 hours ahead.' },
      { q: 'What if I miss it?', a: 'Every live ticket includes the recording, released within 48 hours.' },
    ],
  }),

  makeEvent({
    id: 'evt-010',
    slug: 'open-air-cinema-classics-night',
    title: 'Open Air Cinema: Classics Night',
    tagline: 'Deck chairs, blankets and a 12-metre screen.',
    category: 'film',
    tags: ['cinema', 'outdoor', 'family'],
    type: 'venue',
    cover: '/images/events/event-10.svg',
    start: at(7, 19, 0),
    end: at(7, 23, 0),
    organizerId: 'lumen-arts',
    rating: 4.5,
    reviewsCount: 174,
    views: 7400,
    venue: {
      name: 'Victoria Park Meadow',
      address: 'Grove Rd, London E3 5TB',
      city: 'London',
      country: 'United Kingdom',
      lat: 51.5362,
      lng: -0.0398,
    },
    description: [
      'A restored 35mm classic projected onto a twelve-metre screen as the light goes, with wireless headphones so the sound is perfect wherever you sit.',
      'Deck chairs are included with every ticket, or bring a blanket and claim a patch of the meadow. Street-food traders open when the gates do.',
      'The screening goes ahead in light rain; only high winds cause a cancellation, in which case tickets are refunded in full automatically.',
    ],
    highlights: [
      'Wireless headphones included with every ticket',
      'Deck chair reserved for you on arrival',
      'Street food and licensed bar on site',
      'Automatic full refund if wind cancels the screening',
    ],
    tickets: [
      { id: 'tkt-10a', name: 'General Admission', type: 'oneDay', price: 19, quantity: 1200, sold: 810, description: 'Deck chair and headphones included.', perOrderLimit: 8, salesEnd: at(7) },
      { id: 'tkt-10b', name: 'Family Bundle (4)', type: 'oneDay', price: 64, quantity: 200, sold: 118, description: 'Four admissions with a picnic blanket.', perOrderLimit: 2, salesEnd: at(7), popular: true },
    ],
    schedule: [
      {
        day: 'Screening night',
        date: at(7),
        items: [
          { time: '19:00', title: 'Gates & food traders open' },
          { time: '20:15', title: 'Introduction from the curator' },
          { time: '20:45', title: 'Film begins' },
          { time: '23:00', title: 'Meadow closes' },
        ],
      },
    ],
    faq: [
      { q: 'What happens if it rains?', a: 'The screening runs in light rain — bring a coat. Only high winds cause cancellation, which triggers an automatic refund.' },
      { q: 'Can I bring my own food?', a: 'Yes, picnics are welcome. Glass bottles and alcohol brought from outside are not.' },
    ],
  }),

  makeEvent({
    id: 'evt-011',
    slug: 'coastal-photography-workshop',
    title: 'Coastal Photography Workshop',
    tagline: 'Golden hour on the Algarve cliffs, with a guide.',
    category: 'travel',
    tags: ['photography', 'outdoor', 'workshop'],
    type: 'venue',
    cover: '/images/events/event-11.svg',
    start: at(21, 6, 30),
    end: at(21, 20, 0),
    organizerId: 'the-tasting-room',
    rating: 4.7,
    reviewsCount: 96,
    views: 4900,
    venue: {
      name: 'Ponta da Piedade',
      address: 'Lagos, 8600-644 Faro',
      city: 'Lagos',
      country: 'Portugal',
      lat: 37.0808,
      lng: -8.6683,
    },
    description: [
      'A full-day landscape photography workshop on the Algarve coast, shooting both the sunrise and the sunset from locations chosen for the light rather than the postcard.',
      'Group size is capped at twelve so there is real one-to-one time. Bring any camera — the teaching is about seeing and composition, not gear.',
      'Transport between the three shooting locations, lunch and an afternoon editing session are all included.',
    ],
    highlights: [
      'Sunrise and sunset shoots at three locations',
      'Capped at 12 photographers',
      'Afternoon editing session with feedback',
      'Transport and lunch included',
    ],
    tickets: [
      { id: 'tkt-11a', name: 'Workshop Place', type: 'allDay', price: 210, quantity: 12, sold: 9, description: 'Full day, transport, lunch and editing session.', perOrderLimit: 2, salesEnd: at(19), popular: true },
    ],
    schedule: [
      {
        day: 'Workshop day',
        date: at(21),
        items: [
          { time: '06:30', title: 'Sunrise shoot — Ponta da Piedade' },
          { time: '09:30', title: 'Breakfast & review' },
          { time: '12:00', title: 'Editing session' },
          { time: '17:30', title: 'Sunset shoot — Praia do Camilo' },
          { time: '19:30', title: 'Final review & close' },
        ],
      },
    ],
    faq: [
      { q: 'What gear do I need?', a: 'Any camera with manual control, a spare battery and comfortable shoes. Tripods are provided if you need one.' },
      { q: 'How much walking is involved?', a: 'Around 4km across the day on uneven cliff paths.' },
    ],
  }),

  makeEvent({
    id: 'evt-012',
    slug: 'community-tech-meetup-free',
    title: 'Community Tech Meetup',
    tagline: 'Three talks, free pizza, no badge scanners.',
    category: 'technology',
    tags: ['meetup', 'community', 'free', 'networking'],
    type: 'venue',
    cover: '/images/events/event-12.svg',
    start: at(4, 18, 30),
    end: at(4, 21, 30),
    organizerId: 'stackforge',
    rating: 4.6,
    reviewsCount: 142,
    views: 6100,
    venue: {
      name: 'Factory Berlin Mitte',
      address: 'Rheinsberger Str. 76/77, 10115 Berlin',
      city: 'Berlin',
      country: 'Germany',
      lat: 52.5347,
      lng: 13.3928,
    },
    description: [
      'A relaxed monthly meetup: three short talks from people in the local community, then an hour of actually talking to each other.',
      'Free to attend, but please release your ticket if your plans change — the room fills and the waitlist is real.',
      'Talks are beginner-friendly by design. If you have been meaning to give your first talk, this is the room to do it in.',
    ],
    highlights: [
      'Free entry with a released-ticket waitlist',
      'Three 15-minute community talks',
      'Pizza and drinks provided',
      'First-time speakers actively encouraged',
    ],
    tickets: [
      { id: 'tkt-12a', name: 'Free Entry', type: 'free', price: 0, quantity: 180, sold: 156, description: 'One place at the meetup.', perOrderLimit: 2, salesEnd: at(4) },
    ],
    schedule: [
      {
        day: 'Meetup',
        date: at(4),
        items: [
          { time: '18:30', title: 'Doors, pizza & hello' },
          { time: '19:00', title: 'Talk one' },
          { time: '19:30', title: 'Talk two' },
          { time: '20:00', title: 'Talk three' },
          { time: '20:30', title: 'Open floor & networking' },
        ],
      },
    ],
    faq: [
      { q: 'Do I need a ticket?', a: 'Yes — capacity is fixed by the venue. Please release it if you cannot make it.' },
      { q: 'Can I give a talk?', a: 'Absolutely. Message the organizer from this page with a one-line pitch.' },
    ],
  }),

  makeEvent({
    id: 'evt-013',
    slug: 'midnight-rooftop-sessions',
    title: 'Midnight Rooftop Sessions',
    tagline: 'House music, city lights, and a hard 3am finish.',
    category: 'nightlife',
    tags: ['club night', 'house', 'rooftop'],
    type: 'venue',
    cover: '/images/events/event-13.svg',
    start: at(2, 22, 0),
    end: at(3, 3, 0),
    organizerId: 'nova-collective',
    trending: true,
    rating: 4.4,
    reviewsCount: 268,
    views: 18700,
    ageLimit: '21+',
    venue: {
      name: 'The Vault Rooftop',
      address: '1 Kearny St, San Francisco, CA 94108',
      city: 'San Francisco',
      country: 'United States',
      lat: 37.7891,
      lng: -122.4041,
    },
    description: [
      'Five hours of house and disco on an open rooftop, with two residents and a guest who we announce on the night.',
      'Capacity is small and this one sells out most months — advance tickets are the only reliable way in, as the door queue rarely clears.',
      '21+ only with a valid photo ID. The bar closes at 2:30am and the roof clears at 3am sharp.',
    ],
    highlights: [
      'Two residents plus an unannounced guest',
      'Open rooftop with a covered bar area',
      'Advance tickets only — no guaranteed door entry',
      '21+ with valid photo ID',
    ],
    tickets: [
      { id: 'tkt-13a', name: 'Early Bird', type: 'oneDay', price: 22, quantity: 150, sold: 150, description: 'Discounted advance entry — sold out.', perOrderLimit: 4, salesEnd: at(1) },
      { id: 'tkt-13b', name: 'General Entry', type: 'oneDay', price: 35, quantity: 250, sold: 197, description: 'Standard advance entry before 1am.', perOrderLimit: 4, salesEnd: at(2), popular: true },
    ],
    schedule: [
      {
        day: 'The night',
        date: at(2),
        items: [
          { time: '22:00', title: 'Doors — resident opening set' },
          { time: '00:00', title: 'Guest set' },
          { time: '01:30', title: 'Resident close' },
          { time: '03:00', title: 'Roof clears' },
        ],
      },
    ],
    faq: [
      { q: 'What if it rains?', a: 'The roof runs rain or shine — the bar and half the floor are covered.' },
      { q: 'Is there a dress code?', a: 'No dress code, but bring a jacket. It gets genuinely cold up there.' },
    ],
  }),

  makeEvent({
    id: 'evt-014',
    slug: 'social-impact-summit',
    title: 'Social Impact Summit',
    tagline: 'Where funders, founders and policy people actually meet.',
    category: 'business',
    tags: ['summit', 'nonprofit', 'policy', 'networking'],
    type: 'venue',
    cover: '/images/events/event-14.svg',
    gallery: ['/images/gallery/gallery-6.svg'],
    start: at(56, 9, 0),
    end: at(57, 17, 0),
    organizerId: 'atlas-ventures',
    featured: true,
    rating: 4.6,
    reviewsCount: 205,
    views: 10300,
    venue: {
      name: 'Brooklyn Expo Center',
      address: '72 Noble St, Brooklyn, NY 11222',
      city: 'New York',
      country: 'United States',
      lat: 40.7292,
      lng: -73.9573,
    },
    description: [
      'Two days connecting the people funding social change with the people delivering it — plus the policy staffers who shape the rules both operate under.',
      'The format is deliberately light on keynotes: most of the programme is small-group problem sessions, structured matchmaking and open working time.',
      'Concession and nonprofit rates are available, and every paid ticket funds one free place for a grassroots organiser.',
    ],
    highlights: [
      'Structured matchmaking between funders and founders',
      'Nonprofit and grassroots rates available',
      'Every paid ticket funds a free community place',
      'Childcare available on site by request',
    ],
    tickets: [
      { id: 'tkt-14a', name: 'Standard — Both Days', type: 'allDay', price: 295, quantity: 600, sold: 388, description: 'Full access across both days.', salesEnd: at(54), popular: true },
      { id: 'tkt-14b', name: 'Nonprofit Rate', type: 'allDay', price: 120, quantity: 300, sold: 214, description: 'For registered nonprofits — verification required.', salesEnd: at(54) },
      { id: 'tkt-14c', name: 'Single Day', type: 'oneDay', price: 175, quantity: 250, sold: 96, description: 'Choose either day at checkout.', salesEnd: at(55) },
      { id: 'tkt-14d', name: 'Community Place', type: 'free', price: 0, quantity: 150, sold: 132, description: 'Funded place for grassroots organisers.', perOrderLimit: 1, salesEnd: at(50) },
    ],
    schedule: [
      {
        day: 'Day 1',
        date: at(56),
        items: [
          { time: '09:00', title: 'Registration' },
          { time: '10:00', title: 'Opening: the funding gap, honestly' },
          { time: '11:30', title: 'Problem sessions — round one' },
          { time: '14:00', title: 'Structured matchmaking' },
          { time: '17:30', title: 'Evening reception' },
        ],
      },
      {
        day: 'Day 2',
        date: at(57),
        items: [
          { time: '09:30', title: 'Policy briefing' },
          { time: '11:00', title: 'Problem sessions — round two' },
          { time: '14:00', title: 'Open working time' },
          { time: '16:30', title: 'Commitments & close' },
        ],
      },
    ],
    faq: [
      { q: 'How do I qualify for the nonprofit rate?', a: 'Upload your registration number at checkout — verification usually completes within a day.' },
      { q: 'Is childcare really available?', a: 'Yes, free of charge, but it must be requested at least three weeks ahead.' },
    ],
  }),
]

/* ------------------------------------------------------------- selectors */

export const getEventBySlug = (slug) => events.find((e) => e.slug === slug)
export const getEventById = (id) => events.find((e) => e.id === id)

export const featuredEvents = () => events.filter((e) => e.featured)
export const trendingEvents = () => events.filter((e) => e.trending)
export const freeEvents = () => events.filter((e) => e.isFree)
export const onlineEvents = () => events.filter((e) => e.type === 'online')

export const upcomingEvents = () =>
  [...events].sort((a, b) => new Date(a.start) - new Date(b.start))

export const eventsByOrganizer = (organizerId) =>
  events.filter((e) => e.organizerId === organizerId)

export const eventsByCategory = (categoryId) =>
  events.filter((e) => e.category === categoryId)

/** Same category first, then anything else upcoming. Never returns the source event. */
export function relatedEvents(event, limit = 3) {
  const sameCategory = events.filter((e) => e.id !== event.id && e.category === event.category)
  const rest = events.filter((e) => e.id !== event.id && e.category !== event.category)
  return [...sameCategory, ...rest].slice(0, limit)
}

/** Distinct cities for the location filter. */
export const eventCities = () =>
  [...new Set(events.filter((e) => e.venue).map((e) => e.venue.city))].sort()
