import { getOrganizer } from '@data/organizers'
import { getCategory } from '@data/categories'

/** Dates are relative to load time so the catalogue never goes stale. */
const DAY = 86400000
function at(daysFromNow, hour = 10, minute = 0) {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return new Date(d.getTime() + daysFromNow * DAY).toISOString()
}

/** Calculates the next occurrence of a target day of the week (0=Sun, 5=Fri). */
function nextDayOfWeek(targetDayIndex, hour = 21, minute = 0) {
  const d = new Date()
  const currentDay = d.getDay()
  let daysUntil = (targetDayIndex - currentDay + 7) % 7
  if (daysUntil === 0 && d.getHours() >= hour) {
    daysUntil = 7
  }
  d.setDate(d.getDate() + daysUntil)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

/** Calculates the next upcoming occurrence of a fixed calendar date (e.g. Dec 27). */
function annualDate(monthIndex, dayOfMonth, hour = 20, minute = 0) {
  const now = new Date()
  let year = now.getFullYear()
  const target = new Date(year, monthIndex, dayOfMonth, hour, minute, 0, 0)
  if (target.getTime() < now.getTime()) {
    target.setFullYear(year + 1)
  }
  return target.toISOString()
}

/**
 * Fills derived fields the UI relies on so consumers never recompute them:
 * price range, availability, sold-out state and the resolved organizer.
 */
function makeEvent(event) {
  const tickets = event.tickets.map((t) => ({
    currency: 'GHS',
    perOrderLimit: 10,
    sold: 0,
    ...t,
    remaining: Math.max(0, t.quantity - (t.sold ?? 0)),
  }))

  // Price range reflects what a visitor can actually buy, so a sold-out free
  // tier never advertises the event as "From ₵0".
  const now = Date.now()
  const purchasable = tickets.filter((t) => t.remaining > 0 && new Date(t.salesEnd).getTime() > now)
  const prices = (purchasable.length > 0 ? purchasable : tickets).map((t) => t.price)

  const capacity = tickets.reduce((sum, t) => sum + t.quantity, 0)
  const sold = tickets.reduce((sum, t) => sum + t.sold, 0)

  return {
    currency: 'GHS',
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
      const org = getOrganizer(event.organizerId)
      if (org) return org
      return {
        id: event.organizerId || 'organizer-default',
        name: event.organizerName || 'Eventspady Organizer',
        logo: '/images/organizers/organizer-1.svg',
        location: event.venue?.city ? `${event.venue.city}, Ghana` : 'Wa, Ghana',
        since: 2023,
        rating: 4.9,
        reviews: 120,
        events: 5,
        followers: 1200,
        bio: 'Community and cultural event organizer in the Upper West Region.',
      }
    },
    get categoryMeta() {
      return getCategory(event.category)
    },
  }
}

export const events = [
  makeEvent({
    id: 'evt-001',
    slug: 'dumba-festival-nights-wa',
    title: 'Dumba Festival Nights',
    tagline: 'Three nights of drums, xylophone and smock at the Wa Naa’s Palace.',
    category: 'music',
    tags: ['festival', 'dumba', 'culture', 'live music'],
    type: 'venue',
    cover: '/images/events/dumba-festival.jpg',
    gallery: ['/images/gallery/gallery-1.svg', '/images/gallery/gallery-2.svg', '/images/gallery/gallery-3.svg'],
    start: at(24, 17, 0),
    end: at(26, 23, 30),
    organizerId: 'wa-naa-cultural',
    featured: true,
    trending: true,
    rating: 4.9,
    reviewsCount: 862,
    views: 31400,
    venue: {
      name: 'Wa Naa’s Palace Grounds',
      address: 'Palace Road, Limanyiri, Wa',
      city: 'Wa',
      country: 'Ghana',
      lat: 10.0606,
      lng: -2.5057,
    },
    description: [
      'Dumba is the Waala calendar’s loudest week, and for three nights the palace forecourt turns into an open stage. Master drummers open each evening, the gyil (xylophone) ensembles follow, and the night closes with a live band.',
      'Between sets there is a smock and shea market along the north wall, food from twenty Wa vendors, and a courtyard where the elders explain what each dance is actually saying.',
      'All Days passes cover every night with free re-entry. One Day passes let you pick the night that suits you. Children under 12 enter free with a ticketed adult.',
    ],
    highlights: [
      'Three nights of drumming, gyil ensembles and live bands',
      'Smock, shea butter and craft market on site',
      'Free re-entry all weekend with an All Days pass',
      'Mobile money accepted at every vendor stall',
    ],
    tickets: [
      { id: 'tkt-1a', name: 'Night Pass — Friday', type: 'oneDay', price: 80, quantity: 1200, sold: 1040, description: 'Entry for the Friday programme only.', salesEnd: at(23) },
      { id: 'tkt-1b', name: 'Night Pass — Saturday', type: 'oneDay', price: 120, quantity: 1200, sold: 1118, description: 'Entry for the Saturday headline night.', salesEnd: at(24) },
      { id: 'tkt-1c', name: 'All Nights Pass', type: 'allDay', price: 250, quantity: 1500, sold: 1064, description: 'All three nights with free re-entry.', salesEnd: at(23), popular: true },
      { id: 'tkt-1d', name: 'Palace Circle (VIP)', type: 'allDay', price: 500, quantity: 200, sold: 174, description: 'Raised seating near the drummers, with refreshments.', salesEnd: at(23) },
    ],
    schedule: [
      {
        day: 'Night 1 — Friday',
        date: at(24),
        items: [
          { time: '17:00', title: 'Gates open', description: 'Wristband exchange and market access.' },
          { time: '18:30', title: 'Opening drums — Wa Naa’s ensemble', speaker: 'Palace Forecourt' },
          { time: '20:00', title: 'Gyil showcase', speaker: 'North Stage' },
          { time: '21:30', title: 'Headline — Sombo Sound live band', speaker: 'Palace Forecourt' },
        ],
      },
      {
        day: 'Night 2 — Saturday',
        date: at(25),
        items: [
          { time: '17:00', title: 'Gates open' },
          { time: '18:00', title: 'Smock parade and dance circle' },
          { time: '20:30', title: 'Headline performance', speaker: 'Palace Forecourt' },
          { time: '22:30', title: 'Late session', speaker: 'North Stage' },
        ],
      },
      {
        day: 'Night 3 — Sunday',
        date: at(26),
        items: [
          { time: '16:00', title: 'Gates open' },
          { time: '17:30', title: 'Children’s drumming circle' },
          { time: '20:00', title: 'Closing ceremony with the Wa Naa' },
        ],
      },
    ],
    faq: [
      { q: 'Is re-entry allowed?', a: 'All Nights and Palace Circle holders may leave and re-enter freely. Night Pass holders get one re-entry.' },
      { q: 'Can I bring children?', a: 'Yes. Under-12s enter free alongside a ticketed adult, and Sunday has a dedicated children’s drumming circle.' },
      { q: 'How do I pay at the stalls?', a: 'Most vendors take MTN MoMo and Telecel Cash. Bring some cash for the smaller craft stalls.' },
    ],
  }),

  makeEvent({
    id: 'evt-002',
    slug: 'walk-with-jonjo',
    title: 'Walk With Jonjo',
    tagline: 'Rep Your Jersey Reloaded — United Against Addiction: A walk for a drug free community.',
    category: 'health',
    tags: ['health and wellness', 'walk with jonjo', 'jonjo palace', 'rep your jersey', 'drug free', 'wa'],
    type: 'venue',
    cover: '/images/events/walk-with-jonjo.jpg',
    gallery: ['/images/events/walk-with-jonjo-flyer.jpg'],
    start: at(14, 6, 0),
    end: at(14, 11, 30),
    organizerId: 'jonjo-palace',
    featured: true,
    trending: true,
    rating: 4.95,
    reviewsCount: 742,
    views: 26400,
    venue: {
      name: 'Wa Jubilee Park to Stadium',
      address: 'Jubilee Park Main Grounds, Commercial Area, Wa',
      city: 'Wa',
      country: 'Ghana',
      lat: 10.0595,
      lng: -2.502,
    },
    description: [
      'Jonjo Palace presents Walk With Jonjo — Rep Your Jersey Reloaded!',
      'Theme: United Against Addiction: A Walk for a Drug Free Community — The Role of the Youth.',
      'Join thousands of energetic youth, health champions, and families walking united from Jubilee Park through the streets of Wa to the Sports Stadium. Rep your favorite sports jersey and take a stand for healthy, addiction-free communities across the Upper West Region.',
      'The morning features an energizing aerobics workout, free health screenings, youth empowerment talks, and nutritious breakfast packs. #TogetherWeGrow',
      'For more info & sponsorship: 020 971 3177 / 0248177225 / 020 971 1090.',
    ],
    highlights: [
      'Theme: United Against Addiction — A Walk for a Drug Free Community',
      'Rep Your Jersey Reloaded — come in your favorite sports jersey',
      '8km guided morning fitness walk from Jubilee Park to Wa Sports Stadium',
      'Mass aerobics dance workout led by Coach Jonjo and guest trainers',
      'Free health screenings (blood pressure, blood glucose, BMI checks)',
      'Sponsorship Hotline: 020 971 3177 / 0248177225 / 020 971 1090',
    ],
    tickets: [
      { id: 'tkt-2a', name: 'Free Walk Registration', type: 'free', price: 0, quantity: 2000, sold: 1650, description: 'Free participation in walk, health screenings and aerobics.', salesEnd: at(13), popular: true },
      { id: 'tkt-2b', name: 'Supporter Fitness Pack', type: 'oneDay', price: 60, quantity: 500, sold: 420, description: 'Official Walk With Jonjo t-shirt, sweatband, and energy pack.', salesEnd: at(13) },
      { id: 'tkt-2c', name: 'VIP Wellness Pass', type: 'oneDay', price: 150, quantity: 150, sold: 125, description: 'Frontline aerobics stage spot, dry-fit jersey, bottle & healthy buffet.', salesEnd: at(12) },
    ],
    schedule: [
      {
        day: 'Walk Morning',
        date: at(14),
        items: [
          { time: '05:30', title: 'Arrival, warm-up stretching & kit collection' },
          { time: '06:00', title: 'Flag-off: 8km Walk begins from Jubilee Park' },
          { time: '08:00', title: 'Arrival at Wa Sports Stadium' },
          { time: '08:30', title: 'Mega aerobics session with Coach Jonjo' },
          { time: '10:00', title: 'Anti-addiction health talk & screening' },
          { time: '11:30', title: 'Raffle draw & closing remarks' },
        ],
      },
    ],
    faq: [
      { q: 'What is the dress code?', a: 'Rep Your Jersey! Wear your favorite football, basketball, or sports jersey to celebrate health, youth unity, and a drug-free community.' },
      { q: 'Is registration required to walk?', a: 'Yes, register online for free so we can prepare adequate water stations and medical support.' },
      { q: 'Who do I contact for sponsorship?', a: 'Contact Jonjo Palace directly on 020 971 3177 / 0248177225 / 020 971 1090.' },
    ],
  }),

  makeEvent({
    id: 'evt-003',
    slug: 'northern-founders-roundtable',
    title: 'Northern Founders Roundtable',
    tagline: 'A closed-door session for founders raising their first real round.',
    category: 'business',
    tags: ['startup', 'fundraising', 'networking'],
    type: 'online',
    cover: '/images/events/savannah-devcon.jpg',
    start: at(9, 17, 0),
    end: at(9, 19, 0),
    organizerId: 'ubids-innovation',
    trending: true,
    rating: 4.7,
    reviewsCount: 148,
    views: 6200,
    online: { platform: 'Eventspady Live', joinNote: 'A private join link is attached to your ticket and sent by SMS one hour before the session.' },
    description: [
      'A two-hour, off-the-record roundtable for founders in the northern regions preparing to raise within the next twelve months.',
      'Three founders who have recently closed rounds walk through their real numbers, their decks, and the questions that caught them off guard in investor meetings.',
      'Attendance is capped at fifty so everyone gets to speak. The session is not recorded.',
    ],
    highlights: [
      'Capped at 50 founders for genuine Q&A',
      'Real decks and real numbers, shared off the record',
      'Follow-up introductions circulated afterwards',
      'Not recorded — speak freely',
    ],
    tickets: [
      { id: 'tkt-3a', name: 'Founder Seat', type: 'paid', price: 200, quantity: 50, sold: 38, description: 'One seat in the live roundtable.', perOrderLimit: 2, salesEnd: at(9) },
    ],
    schedule: [
      {
        day: 'Session',
        date: at(9),
        items: [
          { time: '17:00', title: 'Welcome & introductions' },
          { time: '17:20', title: 'Three raise stories, told honestly' },
          { time: '18:15', title: 'Open Q&A' },
          { time: '18:50', title: 'Introductions swap & close' },
        ],
      },
    ],
    faq: [
      { q: 'Will it be recorded?', a: 'No. The session is deliberately off the record so speakers can share candid numbers.' },
      { q: 'Who should attend?', a: 'Founders and senior operators running a revenue-generating business anywhere in the northern regions.' },
    ],
  }),

  makeEvent({
    id: 'evt-004',
    slug: 'home-radio-inter-communities-championship',
    title: 'Home Radio Inter Communities Championship',
    tagline: 'Upper West’s fiercest community football tournament broadcast live by Home Radio 99.7 FM.',
    category: 'sports',
    tags: ['football', 'home radio', 'championship', 'sports', 'wa', 'inter communities'],
    type: 'venue',
    cover: '/images/events/inter-communities-soccer.jpg',
    gallery: ['/images/gallery/gallery-6.svg', '/images/gallery/gallery-1.svg'],
    start: at(7, 15, 0),
    end: at(7, 18, 30),
    organizerId: 'home-radio-997',
    featured: true,
    trending: true,
    rating: 4.9,
    reviewsCount: 512,
    views: 14200,
    venue: {
      name: 'Wa Sports Stadium',
      address: 'Stadium Road, Wa',
      city: 'Wa',
      country: 'Ghana',
      lat: 10.0612,
      lng: -2.5085,
    },
    description: [
      '16 communities across Wa Municipal and Upper West districts compete in the most anticipated annual football showdown, powered by Home Radio 99.7 FM.',
      'Experience roaring grandstand crowds, intense derby rivalries, match commentary by veteran sports broadcasters, and live musical entertainment during halftime.',
      'Tickets grant full stadium admission. Children under 10 enter free when accompanied by a ticketed adult.',
    ],
    highlights: [
      '16 elite community teams competing for the championship trophy',
      'Live match commentary broadcast across the region on Home Radio 99.7 FM',
      'Halftime musical performances and local food court',
      'Secure parking and family-friendly grandstand seating',
    ],
    tickets: [
      { id: 'tkt-4a', name: 'Popular Stand', type: 'oneDay', price: 20, quantity: 2500, sold: 1820, description: 'General admission to the open spectator stands.', perOrderLimit: 6, salesEnd: at(7), popular: true },
      { id: 'tkt-4b', name: 'VIP Covered Stand', type: 'oneDay', price: 50, quantity: 600, sold: 480, description: 'Shaded grandstand seating with prime midfield views.', perOrderLimit: 4, salesEnd: at(7) },
      { id: 'tkt-4c', name: 'Championship Tournament Pass', type: 'allDay', price: 120, quantity: 300, sold: 215, description: 'All-access pass for all group matches and the grand final.', perOrderLimit: 4, salesEnd: at(6) },
    ],
    schedule: [
      {
        day: 'Match Day',
        date: at(7),
        items: [
          { time: '14:00', title: 'Stadium gates open & pre-match build-up' },
          { time: '15:00', title: 'Opening ceremony & community parade' },
          { time: '15:30', title: 'Kick-off: Semi-final 1' },
          { time: '17:00', title: 'Halftime entertainment & raffle draw' },
          { time: '17:45', title: 'Trophy presentation & Home Radio broadcast wrap' },
        ],
      },
    ],
    faq: [
      { q: 'Is the event broadcast live?', a: 'Yes! The entire championship is broadcast live on Home Radio 99.7 FM and streamed online.' },
      { q: 'Are children allowed?', a: 'Yes. Children under 10 enter free with a ticketed adult in the Popular Stand.' },
    ],
  }),

  makeEvent({
    id: 'evt-005',
    slug: 'wa-city-half-marathon',
    title: 'Wa City Marathon & Fun Run',
    tagline: '21km through historic Wa, starting before the morning heat does.',
    category: 'sports',
    tags: ['running', 'marathon', 'road race', 'wa'],
    type: 'venue',
    cover: '/images/events/wa-city-marathon.jpg',
    start: at(31, 5, 30),
    end: at(31, 11, 0),
    organizerId: 'northern-stars-athletics',
    trending: true,
    rating: 4.8,
    reviewsCount: 384,
    views: 11200,
    venue: {
      name: 'Wa Sports Stadium',
      address: 'Stadium Road, Wa',
      city: 'Wa',
      country: 'Ghana',
      lat: 10.0538,
      lng: -2.501,
    },
    description: [
      'A 21.1km scenic road loop starting and finishing at the Wa Sports Stadium, out through Kpaguri and Bamahu and back along the Wa–Kumasi road in the refreshing morning breeze.',
      'The course is marshalled throughout with four hydration points, chip timing, and a five-hour cut-off so walkers and first-timers are warmly welcomed.',
      'Entry includes chip timing, an official finisher medal, post-race koko and technical runner shirt.',
    ],
    highlights: [
      '21.1km road loop · 5-hour cut-off · 4 water points',
      'Official chip timing with live tracking for supporters',
      '05:30 start to beat the heat',
      'Finisher medal, shirt and post-race breakfast',
    ],
    tickets: [
      { id: 'tkt-5a', name: 'Half Marathon Entry', type: 'paid', price: 90, quantity: 700, sold: 512, description: 'Chip-timed entry, medal, shirt and breakfast.', perOrderLimit: 4, salesEnd: at(29), popular: true },
      { id: 'tkt-5b', name: '10K Fun Run Entry', type: 'paid', price: 50, quantity: 500, sold: 341, description: 'Shorter loop on the same course.', perOrderLimit: 4, salesEnd: at(29) },
      { id: 'tkt-5c', name: 'Supporter Pass', type: 'free', price: 0, quantity: 600, sold: 187, description: 'Access to the finish area and breakfast tent.', perOrderLimit: 6, salesEnd: at(30) },
    ],
    schedule: [
      {
        day: 'Race day',
        date: at(31),
        items: [
          { time: '04:45', title: 'Bib collection opens' },
          { time: '05:30', title: 'Half marathon start' },
          { time: '06:00', title: '10K start' },
          { time: '07:15', title: 'First finishers expected' },
          { time: '10:00', title: 'Awards ceremony' },
        ],
      },
    ],
    faq: [
      { q: 'Is there a cut-off?', a: 'Yes — five hours from the gun. Sweepers follow the final runner.' },
      { q: 'Can I transfer my entry?', a: 'Entries can be transferred to another runner from your dashboard up to 7 days before race day.' },
    ],
  }),

  makeEvent({
    id: 'evt-006',
    slug: 'miss-dumba',
    title: 'Miss Dumba',
    tagline: 'The premier beauty, intellect and cultural pageant celebrating Upper West heritage at the Wa Naa’s Palace.',
    category: 'arts',
    tags: ['pageant', 'miss dumba', 'culture', 'fashion', 'wa'],
    type: 'venue',
    cover: '/images/events/miss-dumba.jpg',
    gallery: ['/images/gallery/gallery-2.svg', '/images/gallery/gallery-5.svg'],
    start: at(3, 19, 0),
    end: at(3, 23, 30),
    organizerId: 'wa-naa-cultural',
    featured: true,
    trending: true,
    rating: 4.95,
    reviewsCount: 940,
    views: 38200,
    venue: {
      name: 'Wa Naa’s Palace Forecourt',
      address: 'Palace Road, Limanyiri, Wa',
      city: 'Wa',
      country: 'Ghana',
      lat: 10.0606,
      lng: -2.5057,
    },
    description: [
      'Miss Dumba is the crown jewel of the Dumba Festival, gathering the most inspiring, talented, and articulate young women from across the Upper West Region to celebrate Dagao and Waala cultural heritage, eloquence, and community leadership.',
      'Contestants showcase royal traditional attire in handwoven Northern smocks (fugu), deliver keynote advocacy presentations on northern youth empowerment, and compete in traditional cultural dance and talent categories before a distinguished panel of judges.',
      'The grand crowning ceremony takes place under the historic courtyard lights of the Wa Naa’s Palace, accompanied by royal drumming, live performances, and a high-table VIP reception.',
    ],
    highlights: [
      'Grand cultural crowning ceremony in the presence of the Wa Naa and traditional chiefs',
      'Handwoven Northern Ghanaian smock (fugu) fashion showcase and runway',
      'Empowerment advocacy presentations and traditional cultural talent showcase',
      'Live musical performances and royal cultural drumming by master ensembles',
    ],
    tickets: [
      { id: 'tkt-6a', name: 'Regular Admission', type: 'oneDay', price: 60, quantity: 2000, sold: 1680, description: 'General seating with full view of the pageant stage.', perOrderLimit: 8, salesEnd: at(3), popular: true },
      { id: 'tkt-6b', name: 'VIP Front Row', type: 'oneDay', price: 150, quantity: 500, sold: 412, description: 'Prime front-row table seating, welcome drinks, and photo ops with contestants.', perOrderLimit: 4, salesEnd: at(3) },
      { id: 'tkt-6c', name: 'Patron Table (Seats 4)', type: 'oneDay', price: 500, quantity: 50, sold: 44, description: 'Reserved high-table seating for 4 with chilled refreshments and banquet service.', perOrderLimit: 2, salesEnd: at(2) },
    ],
    schedule: [
      {
        day: 'Coronation Night',
        date: at(3),
        items: [
          { time: '18:00', title: 'Red carpet arrivals & photo call' },
          { time: '19:00', title: 'Royal opening address & Wa Naa procession' },
          { time: '19:45', title: 'Traditional smock fashion & poise category' },
          { time: '21:00', title: 'Talent & cultural advocacy presentations' },
          { time: '22:30', title: 'Final question round & coronation of Miss Dumba' },
        ],
      },
    ],
    faq: [
      { q: 'Is there a dress code?', a: 'Traditional Northern smock (fugu) or elegant cultural African wear is encouraged.' },
      { q: 'Can children attend?', a: 'Yes. Miss Dumba is a celebratory family cultural event. Children under 12 enter free with a ticketed adult.' },
    ],
  }),

  makeEvent({
    id: 'evt-007',
    slug: 'wechiau-riverside-reset-weekend',
    title: 'Riverside Reset Weekend',
    tagline: 'Two nights on the Black Volta, with your phone in a box.',
    category: 'health',
    tags: ['retreat', 'wellness', 'river', 'nature'],
    type: 'venue',
    cover: '/images/events/wechiau-safari.jpg',
    start: at(47, 15, 0),
    end: at(49, 12, 0),
    organizerId: 'wechiau-conservation',
    rating: 4.9,
    reviewsCount: 431,
    views: 7300,
    venue: {
      name: 'Wechiau Hippo Sanctuary Lodge',
      address: 'Talewona Riverside, Wechiau, Wa West District',
      city: 'Wechiau',
      country: 'Ghana',
      lat: 9.7833,
      lng: -2.7833,
    },
    description: [
      'A deliberately unhurried weekend at the sanctuary’s riverside lodge: guided breathwork at sunrise, a dawn canoe along the Black Volta, long walks and no schedule pressure.',
      'Phones go into a box on arrival. You can have yours back whenever you ask — almost nobody does before Sunday.',
      'Two nights in the community-built hippo hide lodges, all meals and every session are included, and the fee goes directly to the twenty landowning communities.',
    ],
    highlights: [
      'Two nights’ lodging and all meals included',
      'Dawn canoe safari on the Black Volta',
      'Group capped at 20 people',
      'Revenue goes to the 20 owning communities',
    ],
    tickets: [
      { id: 'tkt-7a', name: 'Shared Lodge', type: 'allDay', price: 850, quantity: 14, sold: 10, description: 'Twin-share lodge, all meals and sessions.', perOrderLimit: 2, salesEnd: at(40) },
      { id: 'tkt-7b', name: 'Private Lodge', type: 'allDay', price: 1400, quantity: 6, sold: 4, description: 'Private riverside lodge with terrace.', perOrderLimit: 2, salesEnd: at(40), popular: true },
    ],
    schedule: [
      {
        day: 'Friday',
        date: at(47),
        items: [
          { time: '15:00', title: 'Arrival & phone drop' },
          { time: '17:00', title: 'Opening circle by the river' },
          { time: '19:00', title: 'Dinner' },
        ],
      },
      {
        day: 'Saturday',
        date: at(48),
        items: [
          { time: '05:45', title: 'Dawn canoe safari' },
          { time: '08:30', title: 'Breathwork & breakfast' },
          { time: '16:00', title: 'Afternoon session' },
          { time: '20:00', title: 'Fire circle' },
        ],
      },
      {
        day: 'Sunday',
        date: at(49),
        items: [
          { time: '07:00', title: 'Closing breathwork' },
          { time: '09:30', title: 'Brunch & integration' },
          { time: '12:00', title: 'Departure' },
        ],
      },
    ],
    faq: [
      { q: 'Do I need experience?', a: 'None at all. Sessions are guided from first principles.' },
      { q: 'How do I get to Wechiau?', a: 'Roughly 45km from Wa. A shared van leaves the Wa office at 13:00 on Friday and is included in your ticket.' },
    ],
  }),

  makeEvent({
    id: 'evt-008',
    slug: 'all-white-party',
    title: 'All White Party',
    tagline: 'S & S Events presents the 5th Anniversary All White Party — happening every 27th December.',
    category: 'nightlife',
    tags: ['all white party', 's and s events', 'december 27', 'celebration', 'jongara designs', 'nightlife', 'wa'],
    type: 'venue',
    cover: '/images/events/all-white-party.jpg',
    gallery: ['/images/events/all-white-party-flyer.jpg'],
    start: annualDate(11, 27, 20, 0),
    end: annualDate(11, 28, 4, 30),
    organizerId: 's-s-events',
    trending: true,
    featured: true,
    rating: 4.95,
    reviewsCount: 890,
    views: 34200,
    ageLimit: '18+',
    venue: {
      name: 'Sem B Lodge Gardens & Poolside',
      address: 'Near Ministries, Commercial Area, Wa',
      city: 'Wa',
      country: 'Ghana',
      lat: 10.057,
      lng: -2.503,
    },
    description: [
      'S & S Events presents the 5th Anniversary of the All White Party — Wa’s most prestigious end-of-year fashion and nightlife gala!',
      'Happening every 27th December, this landmark anniversary edition unites holidaymakers, returnees, and the finest crowd in Northern Ghana in celebration. Strict all-white dress code.',
      'Featuring breathtaking luxury styling and fashion by Jongara Designs, red carpet arrival photography, celebrity guest DJs, champagne fountains, and VIP poolside cabanas under the savanna night sky.',
      'For table reservations & more info contact: 0200707078 / 0599949738.',
    ],
    highlights: [
      '5th Anniversary edition presented by S & S Events',
      'Takes place every 27th of December annually',
      'Strict all-white dress code with high-fashion red carpet photoshoot',
      'Luxury styling & fashion showcase by Jongara Designs',
      'Exclusive VIP cabanas, premium bottle packages and fireworks at midnight',
      'Table reservations: 0200707078 / 0599949738',
    ],
    tickets: [
      { id: 'tkt-8a', name: 'General Admission', type: 'oneDay', price: 60, quantity: 1500, sold: 1120, description: 'Entry to main gardens and dance stage.', salesEnd: annualDate(11, 27, 21, 0), popular: true },
      { id: 'tkt-8b', name: 'VIP All-White Pass', type: 'oneDay', price: 180, quantity: 300, sold: 245, description: 'VIP lounge access, welcome cocktail & red carpet fast-track.', salesEnd: annualDate(11, 27, 22, 0) },
      { id: 'tkt-8c', name: 'VIP Table for 6', type: 'oneDay', price: 950, quantity: 30, sold: 26, description: 'Reserved poolside table, dedicated server & champagne bottle.', perOrderLimit: 1, salesEnd: annualDate(11, 27, 20, 0) },
    ],
    schedule: [
      {
        day: 'December 27 Night',
        date: annualDate(11, 27, 20, 0),
        items: [
          { time: '20:00', title: 'Red Carpet arrival & welcome champagne' },
          { time: '22:00', title: 'Opening live DJ sets & saxophonist' },
          { time: '00:00', title: 'Midnight Fireworks celebration & toast' },
          { time: '01:00', title: 'Headline celebrity guest DJ takeover' },
          { time: '04:30', title: 'Sunrise after-party chill session' },
        ],
      },
    ],
    faq: [
      { q: 'Is the all-white dress code strictly enforced?', a: 'Yes! All guests must be dressed in white attire to enter the event grounds.' },
      { q: 'Does this event repeat every year?', a: 'Yes, the All White Party takes place every year without fail on the 27th of December.' },
      { q: 'For table bookings and info?', a: 'Contact the organizers directly on 0200707078 or 0599949738.' },
    ],
  }),

  makeEvent({
    id: 'evt-009',
    slug: 'movie-in-the-park',
    title: 'Movie in the Park',
    tagline: 'Under the starlit sky — outdoor family cinema at the Children’s Resource Centre in Wa.',
    category: 'film',
    tags: ['movie in the park', 'outdoor cinema', 'children resource center', 'family', 'wa', 'film'],
    type: 'venue',
    cover: '/images/events/movie-in-the-park.jpg',
    start: at(12, 18, 30),
    end: at(12, 22, 30),
    organizerId: 'jirapa-arts',
    rating: 4.8,
    reviewsCount: 310,
    views: 11400,
    venue: {
      name: 'Children’s Resource Centre',
      address: 'Opposite Regional Library, Central Wa',
      city: 'Wa',
      country: 'Ghana',
      lat: 10.0612,
      lng: -2.5085,
    },
    description: [
      'Experience the magic of Movie in the Park, hosted on the lush green lawns of the Children’s Resource Centre in Wa!',
      'An enchanting evening under the northern night sky with family-friendly Ghanaian, African, and international blockbuster movies projected on a massive illuminated outdoor screen.',
      'Bring picnic mats, camp chairs, and your loved ones. Indulge in warm buttery popcorn, grilled kebabs, cold sobolo, and fresh fruit smoothies under sparkling festoon lights.',
    ],
    highlights: [
      'Huge 40-foot outdoor HD cinema screen with surround acoustic sound',
      'Comfortable picnic lawn at the scenic Children’s Resource Centre',
      'Fresh popcorn, candy floss, sobolo, and barbecue food trucks on site',
      'Fun pre-screening trivia, games, and prizes for children',
    ],
    tickets: [
      { id: 'tkt-9a', name: 'General Admission', type: 'oneDay', price: 30, quantity: 450, sold: 340, description: 'Entry and lawn chair or picnic space access.', perOrderLimit: 6, salesEnd: at(12), popular: true },
      { id: 'tkt-9b', name: 'Family & Friends Bundle (4)', type: 'oneDay', price: 100, quantity: 120, sold: 98, description: 'Admission for 4 with 2 large popcorn packs and drinks.', perOrderLimit: 2, salesEnd: at(12) },
      { id: 'tkt-9c', name: 'VIP Beanbag Front Row', type: 'oneDay', price: 60, quantity: 80, sold: 62, description: 'Plush front-row beanbag lounger with snack service.', perOrderLimit: 4, salesEnd: at(12) },
    ],
    schedule: [
      {
        day: 'Movie Night',
        date: at(12),
        items: [
          { time: '18:00', title: 'Gates open, food stalls active & music' },
          { time: '18:45', title: 'Kids movie trivia & prize giveaways' },
          { time: '19:30', title: 'Feature film screening begins' },
          { time: '21:45', title: 'Post-screening chill & music' },
        ],
      },
    ],
    faq: [
      { q: 'Where exactly is the Children’s Resource Centre?', a: 'It is situated in central Wa, directly opposite the Upper West Regional Library.' },
      { q: 'Can we bring our own mats and chairs?', a: 'Yes! Feel free to bring blankets, picnic mats, and lawn chairs. Standard chairs are also provided.' },
      { q: 'What happens if it rains?', a: 'The venue features covered pavilions and halls to transition smoothly in case of inclement weather.' },
    ],
  }),

  makeEvent({
    id: 'evt-010',
    slug: 'savannah-esports-open',
    title: 'Savannah Esports Invitational',
    tagline: 'Eight elite gaming squads battle for the Northern Championship in Wa.',
    category: 'gaming',
    tags: ['esports', 'tournament', 'gaming', 'fifa', 'valorant'],
    type: 'venue',
    cover: '/images/events/savannah-esports.jpg',
    start: at(15, 11, 0),
    end: at(15, 20, 0),
    organizerId: 'savannah-esports',
    rating: 4.8,
    reviewsCount: 380,
    views: 14600,
    venue: {
      name: 'Wa Sports Stadium Indoor Arena',
      address: 'Stadium Road, Wa',
      city: 'Wa',
      country: 'Ghana',
      lat: 10.0538,
      lng: -2.501,
    },
    description: [
      'The biggest competitive video gaming tournament in the northern sector! 8 top esports teams battle live in EA FC/FIFA, Valorant, and mobile esports for trophy honors and a GHS 25,000 cash pool.',
      'High-energy shoutcasting, LED big screens, spectator seating, and interactive free-to-play gaming kiosks for fans.',
    ],
    highlights: [
      'GHS 25,000 championship tournament prize pool',
      'Professional caster desk and stadium-sized screens',
      'Free-play arcade booths and VR experience stations',
    ],
    tickets: [
      { id: 'tkt-10a', name: 'Spectator Pass', type: 'oneDay', price: 25, quantity: 800, sold: 610, description: 'Arena access to all tournament matches.', salesEnd: at(15), popular: true },
      { id: 'tkt-10b', name: 'Gamer VIP Pass', type: 'oneDay', price: 60, quantity: 200, sold: 175, description: 'Front row seats and priority access to free-play booths.', salesEnd: at(15) },
    ],
    schedule: [
      {
        day: 'Tournament Day',
        date: at(15),
        items: [
          { time: '11:00', title: 'Doors open & group stage matches' },
          { time: '15:00', title: 'Semi-finals broadcast' },
          { time: '18:00', title: 'Grand finals & prize presentation' },
        ],
      },
    ],
    faq: [
      { q: 'Can spectators participate?', a: 'Yes! Casual gaming kiosks are open all day with on-the-spot mini competitions.' },
    ],
  }),

  makeEvent({
    id: 'evt-011',
    slug: 'black-volta-photography-safari',
    title: 'Black Volta Wildlife Safari',
    tagline: 'Golden hour on the river, with a guide who knows where the hippos are.',
    category: 'travel',
    tags: ['photography', 'wildlife', 'outdoor', 'safari'],
    type: 'venue',
    cover: '/images/events/wechiau-safari.jpg',
    start: at(21, 5, 30),
    end: at(21, 19, 0),
    organizerId: 'wechiau-conservation',
    rating: 4.7,
    reviewsCount: 118,
    views: 4400,
    venue: {
      name: 'Wechiau Hippo Sanctuary',
      address: 'Talewona Landing, Wechiau, Wa West District',
      city: 'Wechiau',
      country: 'Ghana',
      lat: 9.7833,
      lng: -2.7833,
    },
    description: [
      'A full-day wildlife and landscape photography workshop on the Black Volta, shooting the dawn canoe run and the sunset from the western bank.',
      'Group size is capped at twelve so there is real one-to-one time. Bring any camera — the teaching is about light, patience and composition rather than gear.',
      'Transport from Wa, lunch at the lodge and an afternoon editing session are all included, and part of the fee supports the sanctuary.',
    ],
    highlights: [
      'Dawn canoe run and sunset shoot on the Black Volta',
      'Capped at 12 photographers',
      'Afternoon editing session with feedback',
      'Transport from Wa and lunch included',
    ],
    tickets: [
      { id: 'tkt-11a', name: 'Workshop Place', type: 'allDay', price: 420, quantity: 12, sold: 8, description: 'Full day, transport, lunch and editing session.', perOrderLimit: 2, salesEnd: at(19), popular: true },
    ],
    schedule: [
      {
        day: 'Workshop day',
        date: at(21),
        items: [
          { time: '05:30', title: 'Depart Wa' },
          { time: '06:30', title: 'Dawn canoe shoot' },
          { time: '09:30', title: 'Breakfast & review' },
          { time: '12:00', title: 'Editing session at the lodge' },
          { time: '17:00', title: 'Sunset shoot — western bank' },
          { time: '19:00', title: 'Return to Wa' },
        ],
      },
    ],
    faq: [
      { q: 'What gear do I need?', a: 'Any camera or smartphone with good resolution. A long lens helps but is not required.' },
    ],
  }),

  makeEvent({
    id: 'evt-012',
    slug: 'nandom-pottery-workshop',
    title: 'Nandom Pottery & Clay Studio',
    tagline: 'Hands-on terracotta earthenware crafting with Nandom master potters.',
    category: 'arts',
    tags: ['pottery', 'crafts', 'nandom', 'workshop', 'culture'],
    type: 'venue',
    cover: '/images/events/nandom-pottery.jpg',
    start: at(10, 9, 0),
    end: at(10, 16, 0),
    organizerId: 'wa-naa-cultural',
    rating: 4.9,
    reviewsCount: 156,
    views: 4800,
    venue: {
      name: 'Nandom Artisan Clay Guild',
      address: 'Market Road, Nandom',
      city: 'Nandom',
      country: 'Ghana',
      lat: 10.8542,
      lng: -2.7667,
    },
    description: [
      'Discover the ancient tradition of Nandom clay pottery. In this hands-on workshop, master artisans teach traditional wheel-throwing and hand-pinching techniques using indigenous terracotta clay.',
      'Every participant shapes, decorates, and kiln-fires their own custom ceramic vase or bowl to take home.',
    ],
    highlights: [
      'Learn directly from generational master potters of Nandom',
      'All clay, tools, and kiln-firing services included',
      'Keep and take home your finished clay creations',
      'Traditional northern tea and snacks provided',
    ],
    tickets: [
      { id: 'tkt-12a', name: 'Studio Workshop Seat', type: 'oneDay', price: 90, quantity: 30, sold: 24, description: 'Full day workshop, clay and fired pottery to take home.', perOrderLimit: 2, salesEnd: at(9), popular: true },
    ],
    schedule: [
      {
        day: 'Workshop Day',
        date: at(10),
        items: [
          { time: '09:00', title: 'Welcome & clay preparation' },
          { time: '10:30', title: 'Potter wheel demonstration' },
          { time: '13:00', title: 'Lunch & studio tour' },
          { time: '14:00', title: 'Finishing, carving & kiln preparation' },
        ],
      },
    ],
    faq: [
      { q: 'Do I need prior experience?', a: 'No, this workshop is designed for complete beginners and intermediate hobbyists alike.' },
    ],
  }),

  makeEvent({
    id: 'evt-013',
    slug: 'bugatti-blackfriday',
    title: 'Bugatti BlackFriday',
    tagline: 'Happening every Friday — Wa’s biggest weekend party at Bugatti Lounge & Club with live DJs and VIP service.',
    category: 'nightlife',
    tags: ['bugatti', 'blackfriday', 'every friday', 'nightlife', 'afrobeats', 'wa'],
    type: 'venue',
    cover: '/images/events/bugatti-blackfriday.jpg',
    start: nextDayOfWeek(5, 21, 0),
    end: nextDayOfWeek(6, 4, 0),
    organizerId: 'bugatti-lounge',
    trending: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 485,
    views: 22400,
    ageLimit: '18+',
    venue: {
      name: 'Bugatti Lounge & Club',
      address: 'Airport Road, Wa',
      city: 'Wa',
      country: 'Ghana',
      lat: 10.0648,
      lng: -2.5063,
    },
    description: [
      'Happening every Friday! Bugatti BlackFriday is Wa’s premier weekly nightlife experience, setting the weekend standard with electric crowds, master mix DJs, and unmatched club energy.',
      'Dance until the early hours to the hottest Afrobeats, Amapiano, highlife and dancehall anthems with state-of-the-art sound, dazzling lighting, signature cocktails, and charcoal grilled treats.',
      'Door queue fills up fast every Friday — reserve your advance entry or VIP table to skip the line.',
    ],
    highlights: [
      'Happens every Friday night from 9:00 PM till dawn',
      'Wa’s premier resident & guest DJs playing Afrobeats, Amapiano, and hip-hop',
      'Outdoor charcoal grill, cocktail bar, and bottle service',
      'VIP booths and skip-the-line express admission',
    ],
    tickets: [
      { id: 'tkt-13a', name: 'Regular Admission', type: 'oneDay', price: 40, quantity: 350, sold: 220, description: 'Standard Friday night entry pass.', perOrderLimit: 4, salesEnd: nextDayOfWeek(5, 22, 0), popular: true },
      { id: 'tkt-13b', name: 'VIP Lounge Pass', type: 'oneDay', price: 100, quantity: 80, sold: 65, description: 'VIP section seating and welcome drink.', perOrderLimit: 4, salesEnd: nextDayOfWeek(5, 23, 0) },
      { id: 'tkt-13c', name: 'VIP Table for 5', type: 'oneDay', price: 500, quantity: 20, sold: 18, description: 'Dedicated lounge table for 5 with bottle service.', perOrderLimit: 1, salesEnd: nextDayOfWeek(5, 21, 0) },
    ],
    schedule: [
      {
        day: 'Friday Night',
        date: nextDayOfWeek(5, 21, 0),
        items: [
          { time: '21:00', title: 'Doors open & warm-up DJ set' },
          { time: '23:00', title: 'Bugatti resident DJ spotlight' },
          { time: '01:00', title: 'Amapiano frenzy & guest DJ set' },
          { time: '04:00', title: 'Late night chill-out & wrap' },
        ],
      },
    ],
    faq: [
      { q: 'How often does this event happen?', a: 'Bugatti BlackFriday happens every Friday throughout the year!' },
      { q: 'Is there an age limit?', a: 'Yes, this is an 18+ nightlife event. Please have a valid ID ready at the door.' },
    ],
  }),

  makeEvent({
    id: 'evt-014',
    slug: 'sombo-sound-clash',
    title: 'Sombo Sound Clash Festival',
    tagline: 'Massive speaker stacks, top selectors, and non-stop northern riddims and Afrobeats.',
    category: 'music',
    tags: ['sound clash', 'live music', 'sombo', 'festival', 'wa', 'afrobeats'],
    type: 'venue',
    cover: '/images/events/sombo-sound-clash.jpg',
    gallery: ['/images/gallery/gallery-6.svg'],
    start: at(28, 17, 0),
    end: at(29, 3, 30),
    organizerId: 'sombo-sound',
    featured: true,
    trending: true,
    rating: 4.9,
    reviewsCount: 420,
    views: 18200,
    venue: {
      name: 'Sombo Cultural Grounds & Arena',
      address: 'Sombo Main Road, Sombo, Wa West',
      city: 'Sombo',
      country: 'Ghana',
      lat: 10.1587,
      lng: -2.5744,
    },
    description: [
      'The most electrifying sound system battle and music festival in the Upper West Region, presented by Sombo Sound Collective!',
      'Heavyweight northern sound crews clash head-to-head in four intense rounds spanning Roots Reggae, Afrobeats, Amapiano, and Northern Dancehall. The champion takes home the prestigious Sombo Golden Turntable trophy, decided by live crowd decibel cheers.',
      'Experience pulsating basslines, guest artist cyphers, open-air charcoal grills, craft cocktail bars, and non-stop celebration under the stars.',
    ],
    highlights: [
      'Premier northern sound clash featuring 4 elite sound systems',
      'Live decibel crowd-meter judging & championship trophy',
      'Guest artist performances, northern hip-hop & dancehall cyphers',
      'Outdoor barbecue grills, craft bar, and festival merchandise',
    ],
    tickets: [
      { id: 'tkt-14a', name: 'General Admission', type: 'oneDay', price: 35, quantity: 1500, sold: 1120, description: 'Access to main arena, food court and clash dancefloor.', salesEnd: at(28), popular: true },
      { id: 'tkt-14b', name: 'VIP Stage Enclosure', type: 'oneDay', price: 90, quantity: 250, sold: 195, description: 'Elevated stage-front seating and 2 complimentary drinks.', salesEnd: at(28) },
      { id: 'tkt-14c', name: 'Clash Crew Table (Seats 5)', type: 'oneDay', price: 400, quantity: 25, sold: 20, description: 'Reserved table for 5 with bottle service and snacks.', perOrderLimit: 1, salesEnd: at(27) },
    ],
    schedule: [
      {
        day: 'Festival Night',
        date: at(28),
        items: [
          { time: '17:00', title: 'Gates open & Sound system acoustic check' },
          { time: '18:30', title: 'Round 1: Roots & Northern Highlife Riddims' },
          { time: '20:30', title: 'Round 2: Afrobeats & Amapiano showdown' },
          { time: '22:30', title: 'Round 3: Dubplate specials & MC cypher' },
          { time: '00:30', title: 'The Final Clash: Decibel crowd decision & trophy ceremony' },
        ],
      },
    ],
    faq: [
      { q: 'What is a sound clash?', a: 'Competing sound systems and DJs duel back-to-back with exclusive track selections and crowd hyping, with the winner crowned by crowd reaction.' },
      { q: 'Is transport available from Wa?', a: 'Yes! Shuttle buses run between Wa Jubilee Park and Sombo Cultural Grounds from 4:00 PM.' },
    ],
  }),

  makeEvent({
    id: 'evt-015',
    slug: 'royal-cosy-hills-jirapa-dubai',
    title: 'Royal Cosy Hills Safari & Pool Experience',
    tagline: 'Experience luxury safari, lakeside chalets, and pool party weekend at Jirapa Dubai.',
    category: 'travel',
    tags: ['royal cosy hills', 'jirapa dubai', 'safari', 'resort', 'travel', 'jirapa', 'upper west'],
    type: 'venue',
    cover: '/images/events/royal-cosy-hills.jpg',
    gallery: ['/images/events/royal-cosy-hills-entrance.jpg'],
    start: at(16, 10, 0),
    end: at(18, 18, 0),
    organizerId: 'royal-cosy-hills',
    featured: true,
    trending: true,
    rating: 4.95,
    reviewsCount: 680,
    views: 31200,
    venue: {
      name: 'Royal Cosy Hills Hotel & Safari Resort (Jirapa Dubai)',
      address: 'Jirapa-Nandom Highway, Jirapa',
      city: 'Jirapa',
      country: 'Ghana',
      lat: 10.5312,
      lng: -2.7045,
    },
    description: [
      'Escape to Northern Ghana’s most celebrated holiday paradise: Royal Cosy Hills, affectionately nicknamed "Jirapa Dubai"!',
      'Nestled amidst rolling savanna hills, this world-class luxury resort features wild animal safari tours, Olympic-sized swimming pools, quad biking, artificial lakes, amusement park rides, and five-star Ghanaian hospitality.',
      'Whether you are visiting for a scenic weekend day-pass or booking full chalet accommodation, enjoy live acoustic evening performances, curated northern gastronomy, and safari encounters with zebras, ostriches, antelopes, and exotic birds.',
    ],
    highlights: [
      'Guided wildlife safari drive through the resort animal sanctuary',
      'Access to the Olympic pool, kids water splash park & jacuzzis',
      'Quad biking, artificial lake boat cruises & golf cart tours',
      'Sumptuous buffet lunch featuring authentic northern delicacies & continental dishes',
    ],
    tickets: [
      { id: 'tkt-15a', name: 'Day Safari & Pool Pass', type: 'oneDay', price: 120, quantity: 500, sold: 380, description: 'Full day access to resort grounds, safari tour, and swimming pool.', salesEnd: at(16), popular: true },
      { id: 'tkt-15b', name: 'Family Adventure Package (4)', type: 'oneDay', price: 380, quantity: 150, sold: 115, description: 'Day entry for 2 adults and 2 children, safari ride & lunch voucher.', salesEnd: at(16) },
      { id: 'tkt-15c', name: 'VIP Weekend Chalet Experience', type: 'allDay', price: 1250, quantity: 25, sold: 21, description: '2 nights luxury chalet stay, private safari tour, all meals & VIP lounge access.', perOrderLimit: 2, salesEnd: at(15) },
    ],
    schedule: [
      {
        day: 'Day 1 — Arrival & Safari',
        date: at(16),
        items: [
          { time: '10:00', title: 'Arrival, welcome drinks & resort check-in' },
          { time: '11:30', title: 'Guided Wildlife Safari Drive' },
          { time: '13:30', title: 'Savannah gourmet buffet lunch' },
          { time: '15:30', title: 'Poolside splash session & quad biking' },
          { time: '19:00', title: 'Lakeside barbecue & acoustic highlife night' },
        ],
      },
      {
        day: 'Day 2 — Adventure & Relaxation',
        date: at(17),
        items: [
          { time: '08:00', title: 'Sunrise lake boat ride & breakfast' },
          { time: '10:30', title: 'Amusement park & sports facilities' },
          { time: '14:00', title: 'Chef’s special roast guinea fowl lunch' },
          { time: '17:00', title: 'Sunset photography at the Hilltop Gazebo' },
        ],
      },
    ],
    faq: [
      { q: 'Where is Royal Cosy Hills located?', a: 'It is situated in Jirapa, approximately 45 minutes drive north of Wa along smooth asphalt roads.' },
      { q: 'Is transport available from Wa?', a: 'Yes, shuttle vans depart from Wa Municipal Jubilee Park on Saturday mornings at 08:30 AM.' },
      { q: 'Are child tickets discounted?', a: 'Children under 5 enter free. Special family adventure passes cover up to 2 adults and 2 children.' },
    ],
  }),

  makeEvent({
    id: 'evt-016',
    slug: 'savannah-tech-summit-hackathon',
    title: 'Savannah Tech Summit & Hackathon',
    tagline: 'Northern Ghana’s developers, AI innovators and startup builders convening at UBIDS Bamahu.',
    category: 'technology',
    tags: ['technology', 'hackathon', 'ai', 'developers', 'wa', 'ubids'],
    type: 'venue',
    cover: '/images/events/savannah-devcon.jpg',
    start: at(18, 9, 0),
    end: at(19, 18, 0),
    organizerId: 'ubids-innovation',
    featured: false,
    trending: true,
    rating: 4.85,
    reviewsCount: 290,
    views: 9400,
    venue: {
      name: 'UBIDS Innovation Hub & Auditorium',
      address: 'Simon Diedong Dombo University Campus, Bamahu, Wa',
      city: 'Wa',
      country: 'Ghana',
      lat: 10.0387,
      lng: -2.4844,
    },
    description: [
      'The premier gathering of software engineers, founders, and students in Northern Ghana, hosted by UBIDS Innovation Hub in Bamahu.',
      'A 48-hour build sprint addressing real-world savanna challenges in agritech, mobile money, and digital education. Features keynote addresses from national tech leaders, technical workshops on AI and cloud architecture, and a 20,000 GHS demo-day prize pool.',
    ],
    highlights: [
      '48-hour hackathon with mentor guidance and cloud credits',
      '20,000 GHS demo-day innovation prize pool',
      'Keynote panels on AI in agriculture and fintech expansion',
      'Free lunch, high-speed WiFi, and hackathon swag packs',
    ],
    tickets: [
      { id: 'tkt-16a', name: 'General Summit Pass', type: 'free', price: 0, quantity: 300, sold: 210, description: 'Access to speaker sessions, panels, and exhibition booths.', salesEnd: at(18), popular: true },
      { id: 'tkt-16b', name: 'Hacker Team Seat', type: 'paid', price: 50, quantity: 80, sold: 65, description: 'Hackathon team entry, swag pack, and 24hr lab access.', salesEnd: at(17) },
    ],
    schedule: [
      {
        day: 'Day 1 — Keynotes & Hackathon Kickoff',
        date: at(18),
        items: [
          { time: '09:00', title: 'Registration & breakfast' },
          { time: '10:00', title: 'Opening keynote: Building Tech for the Savanna' },
          { time: '12:00', title: 'Hackathon challenge reveal & team matching' },
          { time: '14:00', title: 'Build sprint begins' },
        ],
      },
      {
        day: 'Day 2 — Demo Day & Awards',
        date: at(19),
        items: [
          { time: '10:00', title: 'Technical workshops & code freeze' },
          { time: '14:00', title: 'Top 8 team pitch presentations' },
          { time: '17:00', title: 'Awards ceremony & networking mixer' },
        ],
      },
    ],
    faq: [
      { q: 'Can beginners join the hackathon?', a: 'Yes! Mentors will be available to help teams build and deploy their MVPs.' },
    ],
  }),

  makeEvent({
    id: 'evt-017',
    slug: 'upper-west-food-tuo-zaafi-festival',
    title: 'Upper West Food & Tuo Zaafi Fest',
    tagline: 'A savory culinary celebration of authentic savanna flavours, guinea fowl barbecue, and local craft drinks.',
    category: 'food-drink',
    tags: ['food', 'tuo zaafi', 'guinea fowl', 'cuisine', 'wa', 'upper west'],
    type: 'venue',
    cover: '/images/events/shea-agro-expo.jpg',
    start: at(22, 11, 0),
    end: at(22, 21, 0),
    organizerId: 'upper-west-eats',
    featured: false,
    trending: true,
    rating: 4.9,
    reviewsCount: 360,
    views: 12100,
    venue: {
      name: 'In-Service Training Centre Courtyard',
      address: 'Hospital Road, Central Wa',
      city: 'Wa',
      country: 'Ghana',
      lat: 10.0592,
      lng: -2.5038,
    },
    description: [
      'Upper West Eats invites all food lovers to celebrate the rich culinary traditions of the savanna at the annual Tuo Zaafi & Northern Flavours Festival!',
      'Taste hot, steaming bowls of authentic Tuo Zaafi (TZ) served with aromatic ayoyo, dry okro, and bito soups; savor seasoned spicy charcoal-grilled guinea fowl and tender lamb; and refresh with chilled calabashes of fresh pito, sobolo, and baobab smoothies.',
    ],
    highlights: [
      'Over 25 master northern chefs and food artisans',
      'The Great TZ Cook-Off and public tasting jury',
      'Charcoal-grilled guinea fowl and artisanal pito bar',
      'Live traditional acoustic xylophone (gyil) entertainment',
    ],
    tickets: [
      { id: 'tkt-17a', name: 'Foodie Tasting Pass', type: 'oneDay', price: 30, quantity: 800, sold: 540, description: 'Entry plus 3 complimentary dish tasting vouchers.', salesEnd: at(22), popular: true },
      { id: 'tkt-17b', name: 'VIP Feast & Craft Drinks', type: 'oneDay', price: 90, quantity: 150, sold: 112, description: 'VIP courtyard seating, unlimited buffet tasting & fresh drinks.', salesEnd: at(22) },
    ],
    schedule: [
      {
        day: 'Festival Day',
        date: at(22),
        items: [
          { time: '11:00', title: 'Gates open & Tasting stalls active' },
          { time: '13:00', title: 'The Great TZ Soup Competition' },
          { time: '16:00', title: 'Master chef demonstration on dawadawa seasoning' },
          { time: '18:00', title: 'Sunset acoustic gyil music & barbecue evening' },
        ],
      },
    ],
    faq: [
      { q: 'Are vegetarian options available?', a: 'Yes! A variety of plant-based soups, beans, yam, and fresh savanna greens will be served.' },
    ],
  }),

  makeEvent({
    id: 'evt-018',
    slug: 'upper-west-stem-youth-innovation-expo',
    title: 'Upper West STEM & Youth Expo',
    tagline: 'Inspiring high school and college students with robotics, coding, solar energy demos, and tech careers.',
    category: 'education',
    tags: ['education', 'stem', 'robotics', 'youth', 'science', 'wa'],
    type: 'venue',
    cover: '/images/events/event-12.svg',
    start: at(16, 9, 0),
    end: at(16, 16, 0),
    organizerId: 'ubids-innovation',
    featured: false,
    trending: true,
    rating: 4.85,
    reviewsCount: 195,
    views: 7800,
    venue: {
      name: 'Wa Senior High Technical School Auditorium',
      address: 'School Road, Kpaguri, Wa',
      city: 'Wa',
      country: 'Ghana',
      lat: 10.0545,
      lng: -2.5022,
    },
    description: [
      'A one-day interactive science, technology, engineering, and mathematics (STEM) showcase empowering the next generation of northern innovators.',
      'Students from across Upper West high schools and colleges showcase working robotics projects, solar power models, mobile apps, and environmental solutions, alongside hands-on lab experiments and career mentorship clinics.',
    ],
    highlights: [
      'Over 40 student science & robotics exhibition booths',
      'Hands-on coding and micro-controller hardware workshops',
      'University scholarship & engineering career advisory booths',
      'Prizes and certificates for outstanding student innovations',
    ],
    tickets: [
      { id: 'tkt-18a', name: 'Free Student / Educator Pass', type: 'free', price: 0, quantity: 1000, sold: 760, description: 'Free entry for students, teachers, and parents.', salesEnd: at(16), popular: true },
      { id: 'tkt-18b', name: 'Patron Supporter Pass', type: 'paid', price: 50, quantity: 100, sold: 68, description: 'Front-row seating and direct sponsorship of student project kits.', salesEnd: at(16) },
    ],
    schedule: [
      {
        day: 'Expo Day',
        date: at(16),
        items: [
          { time: '09:00', title: 'Doors open & exhibition galleries active' },
          { time: '10:30', title: 'Robotics obstacle course competition' },
          { time: '13:00', title: 'Keynote by northern women engineers' },
          { time: '15:00', title: 'Awards ceremony & closing exhibitions' },
        ],
      },
    ],
    faq: [
      { q: 'Can parents attend?', a: 'Yes! Families and educators are warmly welcome. Admission is completely free.' },
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

/** Distinct towns for the location filter. */
export const eventCities = () =>
  [...new Set(events.filter((e) => e.venue).map((e) => e.venue.city))].sort()
