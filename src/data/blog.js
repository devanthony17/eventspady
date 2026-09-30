const DAY = 86400000
const daysAgo = (n) => new Date(Date.now() - n * DAY).toISOString()

export const blogCategories = ['Organizer tips', 'Product', 'Marketing', 'Payments', 'Community']

export const posts = [
  {
    id: 'post-1',
    slug: 'how-was-biggest-festivals-sell-out-in-record-time',
    title: "How Wa's Biggest Festivals Sell Out in Record Time: The Modern Ticketing Playbook",
    excerpt:
      'From royal cultural festivals like Dumba to buzzing nightlife events at Bugatti Lounge, here is how top Ghanaian promoters eliminate checkout friction, mobilize WhatsApp communities, and drive record advance sales.',
    cover: '/images/blog/blog-festival-playbook.jpg',
    category: 'Marketing',
    tags: ['ticket sales', 'promotion', 'dumba festival', 'wa'],
    author: { name: 'Abena Sowah', role: 'Head of Organizer Success', avatar: '/images/avatars/avatar-abena-sowah.jpg' },
    publishedAt: daysAgo(3),
    featured: true,
    body: [
      { type: 'p', text: 'Every promoter and cultural planner in the Upper West asks the same question: how do we turn community excitement into verified advance ticket sales? The reality is that Ghanaian events rarely suffer from a lack of demand; they suffer from checkout friction, sluggish payment confirmations, and confusion at the gate.' },
      { type: 'h2', text: '1. Launch your listing before final promotional flyers drop' },
      { type: 'p', text: 'A clean digital ticket listing with dates, ticket tiers, and a clear venue location will outperform a delayed announcement every time. Audiences in Wa and across the region can bookmark, plan their budgets, and register interest weeks before the final sound clash lineup or special guests are revealed.' },
      { type: 'h2', text: '2. Respect tiered pricing deadlines' },
      { type: 'p', text: 'Early-bird pricing only creates genuine urgency if prices strictly increase on the promised date. When an organizer extends early birds repeatedly, buyers immediately learn to stall until the final hour.' },
      { type: 'quote', text: 'The moment you honour your ticket cutoff deadlines, your advance ticket velocity triples.' },
      { type: 'h2', text: '3. Tap into regional WhatsApp & social community circles' },
      { type: 'p', text: 'In Ghana, direct word-of-mouth in youth groups, university alumni circles, and community forums moves tickets faster than expensive billboard campaigns. Eventspady ticket links generate instant rich link previews with verified pricing and MoMo prompts.' },
      { type: 'h2', text: '4. Streamline the checkout experience' },
      { type: 'p', text: 'Never ask for ten fields when three will do. With direct MTN MoMo and Telecel Cash integration, an attendee inputs their phone number, confirms the USSD prompt on their handset, and receives their QR ticket in seconds.' },
    ],
  },
  {
    id: 'post-2',
    slug: 'instant-qr-check-ins-and-offline-gate-validation',
    title: "Instant QR Check-ins & Offline Gate Validation: A Door Manager's Field Guide",
    excerpt:
      'Why spotty network connectivity at festival grounds never slows down Eventspady scanners, and how multi-lane QR check-ins cleared 5,000 attendees in 45 minutes flat.',
    cover: '/images/blog/blog-qr-scanner-gate.jpg',
    category: 'Product',
    tags: ['qr code', 'door scanner', 'operations', 'gate management'],
    author: { name: 'Eric Naah', role: 'Operations & Event Logistics', avatar: '/images/avatars/avatar-eric-naah.jpg' },
    publishedAt: daysAgo(9),
    featured: true,
    body: [
      { type: 'p', text: 'When thousands of energetic attendees arrive at the palace forecourt or stadium gates simultaneously, the last thing any event organizer wants is a network timeout. Eventspady’s offline-first architecture ensures that ticket validation never stops.' },
      { type: 'h2', text: 'How offline validation works' },
      { type: 'p', text: 'Prior to opening the gates, door staff download the encrypted guest ledger onto their smartphones. When scanning an attendee’s digital QR code, validation happens locally in milliseconds — screen turns green, audio chirps, and the attendee is admitted instantly.' },
      { type: 'h2', text: 'Automatic sync and duplicate protection' },
      { type: 'p', text: 'As soon as network connectivity is detected, all local check-ins sync automatically with central servers. If an attendee attempts to pass a duplicate screenshot to a friend outside, the scanner immediately sounds a duplicate warning for door supervisors.' },
    ],
  },
  {
    id: 'post-3',
    slug: 'the-mobile-money-revolution-in-event-ticketing',
    title: 'The Mobile Money Revolution in Event Ticketing: MTN MoMo & Telecel Cash Mastery',
    excerpt:
      'Over 88% of Ghanaian event-goers pay with Mobile Money. Discover how instant USSD prompts, dynamic MoMo web checkout, and zero-dropoff payments double advance ticket conversion.',
    cover: '/images/blog/blog-momo-payments.jpg',
    category: 'Payments',
    tags: ['mtn momo', 'telecel cash', 'ghana', 'payments'],
    author: { name: 'Sulemana Iddrisu', role: 'Payments & Cultural Partnerships', avatar: '/images/avatars/avatar-sulemana-iddrisu.jpg' },
    publishedAt: daysAgo(15),
    featured: true,
    body: [
      { type: 'p', text: 'Credit cards might dominate western e-commerce, but across Ghana and the Upper West, Mobile Money is the undisputed king of commerce. Enabling frictionless MoMo settlements is the single most important factor for event sales success.' },
      { type: 'h2', text: 'Instant push USSD notifications' },
      { type: 'p', text: 'Instead of redirecting buyers to third-party bank portals, Eventspady triggers an instantaneous USSD approval prompt directly on the buyer’s phone. The buyer enters their PIN, the order completes, and the QR ticket appears instantly on screen.' },
      { type: 'h2', text: 'Reconciled settlements for organizers' },
      { type: 'p', text: 'Organizers receive itemised revenue disbursements directly into their registered MoMo Merchant wallets or commercial bank accounts without reconciliation disputes.' },
    ],
  },
  {
    id: 'post-4',
    slug: 'setting-up-outdoor-venue-and-festival-experiences',
    title: 'Setting Up Outdoor Venue & Festival Experiences in the Upper West',
    excerpt:
      'Deciding between Jubilee Park, Sem B Lodge poolside, and Jirapa safari grounds: logistics, power backup, sound engineering, and crowd management essentials.',
    cover: '/images/blog/blog-outdoor-venue.jpg',
    category: 'Organizer tips',
    tags: ['venues', 'outdoor events', 'planning', 'logistics'],
    author: { name: 'Paulina Kuu-ire', role: 'Community Lead', avatar: '/images/avatars/avatar-paulina-kuu-ire.jpg' },
    publishedAt: daysAgo(22),
    body: [
      { type: 'p', text: 'Whether hosting 500 guests for an All-White celebration at Sem B Lodge or 10,000 for a cultural showcase, managing venue layout dictates attendee satisfaction and safety.' },
      { type: 'h2', text: 'Power redundancy is non-negotiable' },
      { type: 'p', text: 'Always ensure dual generator power with automatic changeover switches for DJ booths, sound reinforcement, and gate lighting.' },
      { type: 'h2', text: 'Separate ingress, VIP, and general admission lanes' },
      { type: 'p', text: 'Well-marked entrance gates with high-visibility signage prevent bottlenecks and keep queues moving effortlessly.' },
    ],
  },
  {
    id: 'post-5',
    slug: 'writing-an-event-description-people-read',
    title: 'Writing an event description people actually read',
    excerpt:
      'Most descriptions are written for the organizer, not the attendee. A simple restructure fixes it.',
    cover: '/images/blog/blog-festival-playbook.jpg',
    category: 'Marketing',
    tags: ['copywriting', 'listings'],
    author: { name: 'Abena Sowah', role: 'Head of Organizer Success', avatar: '/images/avatars/avatar-abena-sowah.jpg' },
    publishedAt: daysAgo(29),
    body: [
      { type: 'p', text: 'Open with what happens, not with who you are. A reader deciding whether to spend an evening with you needs the shape of that evening before they need your founding story.' },
      { type: 'h2', text: 'Answer the four questions' },
      { type: 'p', text: 'What will I experience, who else will be there, what does it cost me in time and money, and what do I need to bring. Everything else is decoration.' },
    ],
  },
  {
    id: 'post-6',
    slug: 'managing-guest-lists-without-losing-your-mind',
    title: 'Managing guest lists without losing your mind',
    excerpt:
      'Comps, plus-ones, VIPs and last-minute additions — a workflow that keeps the door calm.',
    cover: '/images/blog/blog-qr-scanner-gate.jpg',
    category: 'Organizer tips',
    tags: ['guest list', 'operations', 'check-in'],
    author: { name: 'Alhaji Mumuni Bakuri', role: 'Palace Programme Lead', avatar: '/images/avatars/avatar-alhaj-mumuni.jpg' },
    publishedAt: daysAgo(37),
    body: [
      { type: 'p', text: 'Guest lists go wrong in predictable ways: names added over text message, plus-ones nobody logged, and a door team discovering both at once.' },
      { type: 'h2', text: 'One list, one source' },
      { type: 'p', text: 'Issue comp tickets rather than keeping a separate spreadsheet. A comp is a real ticket with a real QR code, so the door treats it identically and your numbers stay honest.' },
    ],
  },
  {
    id: 'post-7',
    slug: 'accessibility-basics-for-event-organizers',
    title: 'Accessibility basics for event organizers',
    excerpt:
      'A short, practical checklist that covers most of what attendees need — and what to publish so they can decide for themselves.',
    cover: '/images/blog/blog-outdoor-venue.jpg',
    category: 'Organizer tips',
    tags: ['accessibility', 'inclusion', 'planning'],
    author: { name: 'Paulina Kuu-ire', role: 'Community Lead', avatar: '/images/avatars/avatar-paulina-kuu-ire.jpg' },
    publishedAt: daysAgo(44),
    body: [
      { type: 'p', text: 'The single most useful thing you can do is publish accurate access information. Attendees are experts in their own needs; they need facts, not reassurance.' },
    ],
  },
  {
    id: 'post-8',
    slug: 'what-we-shipped-this-quarter',
    title: 'What we shipped this quarter on Eventspady',
    excerpt:
      'Offline ticket scanning, Mobile Money instant prompts, pay-at-the-gate compliance protection, and live sales telemetry.',
    cover: '/images/blog/blog-momo-payments.jpg',
    category: 'Product',
    tags: ['changelog', 'release'],
    author: { name: 'Gifty Bawa', role: 'Product Operations', avatar: '/images/avatars/avatar-gifty-bawa.jpg' },
    publishedAt: daysAgo(52),
    body: [
      { type: 'p', text: 'A round-up of everything that landed this quarter across the website, the organizer panel and the scanner app.' },
    ],
  },
]

export const getPost = (slug) => posts.find((p) => p.slug === slug)
export const featuredPosts = () => posts.filter((p) => p.featured)
export const recentPosts = (limit = 3) =>
  [...posts].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)).slice(0, limit)
export const relatedPosts = (post, limit = 3) =>
  posts.filter((p) => p.id !== post.id && p.category === post.category).slice(0, limit)
