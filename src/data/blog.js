const DAY = 86400000
const daysAgo = (n) => new Date(Date.now() - n * DAY).toISOString()

export const blogCategories = ['Organizer tips', 'Product', 'Marketing', 'Payments', 'Community']

export const posts = [
  {
    id: 'post-1',
    slug: 'seven-ways-to-sell-out-your-next-event',
    title: 'Seven ways to sell out your next event',
    excerpt:
      'Selling out is rarely about spending more on ads. It is about removing friction, building urgency honestly, and giving people a reason to tell a friend.',
    cover: '/images/blog/blog-1.svg',
    category: 'Marketing',
    tags: ['ticket sales', 'promotion', 'pricing'],
    author: { name: 'Amara Diallo', role: 'Head of Organizer Success', avatar: '/images/avatars/avatar-1.svg' },
    publishedAt: daysAgo(3),
    featured: true,
    body: [
      { type: 'p', text: 'Every organizer we speak to asks the same question in some form: how do I sell more tickets? The honest answer is that most events do not have a demand problem, they have a friction problem. People wanted to come and something got in the way.' },
      { type: 'h2', text: '1. Publish before you are ready' },
      { type: 'p', text: 'A listing with a date, a city and a price outperforms a perfect listing published three weeks later. You can refine the description, add the line-up and swap the cover image at any point. What you cannot recover is the month of discovery you lost while polishing.' },
      { type: 'h2', text: '2. Price in tiers, and mean it' },
      { type: 'p', text: 'Early-bird pricing only creates urgency if the price genuinely rises when you said it would. Audiences notice when a tier quietly extends, and the next time you run an early bird they will simply wait.' },
      { type: 'quote', text: 'The fastest way to devalue a deadline is to move it once.' },
      { type: 'h2', text: '3. Make the first ticket easy to find' },
      { type: 'p', text: 'If someone lands on your page and cannot see a price within one screen, you have added a decision where there did not need to be one. Lead with your most popular tier and let the alternatives sit below it.' },
      { type: 'h2', text: '4. Give attendees something to share' },
      { type: 'p', text: 'Word of mouth still outperforms paid acquisition for local events by a wide margin. A shareable line-up graphic, a referral discount or simply a well-written description that people want to forward will move more tickets than an equivalent ad budget.' },
      { type: 'h2', text: '5. Use coupons with real constraints' },
      { type: 'p', text: 'A coupon that works forever is a price cut. A coupon limited to a specific event, a fixed number of redemptions and a firm expiry is a campaign you can measure.' },
      { type: 'h2', text: '6. Reduce checkout steps' },
      { type: 'p', text: 'Every additional required field costs you conversions. Ask for what you need to run the event and collect the rest afterwards if you truly need it.' },
      { type: 'h2', text: '7. Follow up after the event' },
      { type: 'p', text: 'The best moment to sell your next event is the week after your last one, while the experience is fresh. A short thank-you with an early link converts remarkably well.' },
    ],
  },
  {
    id: 'post-2',
    slug: 'qr-check-in-what-actually-happens-at-the-door',
    title: 'QR check-in: what actually happens at the door',
    excerpt:
      'A walkthrough of how ticket validation works end to end, why offline scanning matters, and how to staff a door so queues never form.',
    cover: '/images/blog/blog-2.svg',
    category: 'Product',
    tags: ['qr code', 'check-in', 'operations'],
    author: { name: 'Tomas Lindqvist', role: 'Product Manager', avatar: '/images/avatars/avatar-2.svg' },
    publishedAt: daysAgo(9),
    featured: true,
    body: [
      { type: 'p', text: 'When an order is placed, Eventspady generates a unique QR code per ticket. That code encodes an order reference and a signed token — not the attendee’s personal data — so a photographed ticket reveals nothing sensitive.' },
      { type: 'h2', text: 'The scan itself' },
      { type: 'p', text: 'Your scanner app reads the code and checks three things: is this ticket valid for this event, has it already been used, and is it being scanned inside the permitted window. A pass turns the screen green and marks the ticket as checked in.' },
      { type: 'h2', text: 'Why offline mode matters' },
      { type: 'p', text: 'Venues have terrible signal. The scanner caches the guest list before doors open, validates locally and syncs check-ins as connectivity allows. Duplicate scans across devices are reconciled on sync and flagged for the door lead.' },
      { type: 'h2', text: 'Staffing the door' },
      { type: 'p', text: 'As a rule of thumb, one scanner handles about 250 guests per hour comfortably. Two lanes and a floating supervisor will clear a thousand-person door in well under an hour without anyone feeling rushed.' },
    ],
  },
  {
    id: 'post-3',
    slug: 'choosing-between-online-and-venue-events',
    title: 'Choosing between online and venue events',
    excerpt:
      'The format you pick changes your economics, your audience and your production load. Here is how to decide before you commit.',
    cover: '/images/blog/blog-3.svg',
    category: 'Organizer tips',
    tags: ['strategy', 'online events', 'planning'],
    author: { name: 'Priya Raman', role: 'Community Lead', avatar: '/images/avatars/avatar-3.svg' },
    publishedAt: daysAgo(15),
    body: [
      { type: 'p', text: 'Online events scale cheaply but compete with every other tab. Venue events command attention but carry fixed costs from the moment you sign. Most organizers pick based on habit rather than fit.' },
      { type: 'h2', text: 'Ask what the room is for' },
      { type: 'p', text: 'If the value is the content, online almost always wins. If the value is the people meeting each other, a venue is worth every euro of the deposit.' },
      { type: 'h2', text: 'Hybrid is two events' },
      { type: 'p', text: 'Running both at once is not a compromise, it is a second production with its own crew and its own failure modes. Do it deliberately or not at all.' },
    ],
  },
  {
    id: 'post-4',
    slug: 'setting-up-payments-and-payouts',
    title: 'Setting up payments and payouts',
    excerpt:
      'Stripe, PayPal, Flutterwave, Razorpay or wallet — which channels to enable, what they cost you, and when the money lands.',
    cover: '/images/blog/blog-4.svg',
    category: 'Payments',
    tags: ['stripe', 'payouts', 'fees'],
    author: { name: 'Daniel Okoro', role: 'Payments', avatar: '/images/avatars/avatar-4.svg' },
    publishedAt: daysAgo(22),
    body: [
      { type: 'p', text: 'Enable the channels your audience actually uses rather than all of them. A cluttered checkout costs more in abandoned carts than a missing option costs in lost sales.' },
      { type: 'h2', text: 'What each channel is good at' },
      { type: 'p', text: 'Stripe covers cards and wallets in most markets. Razorpay is the practical default for UPI and Indian netbanking. Flutterwave handles mobile money across much of Africa. PayPal converts well with audiences who already have a balance.' },
      { type: 'h2', text: 'Offline payment' },
      { type: 'p', text: 'Cash on check-in still matters for community events. The ticket is reserved and marked unpaid, and your door staff settle it on the scanner when the guest arrives.' },
      { type: 'h2', text: 'When you get paid' },
      { type: 'p', text: 'Payouts are released after the event completes, minus platform commission and any refunds. You can see the full breakdown on each order before the money moves.' },
    ],
  },
  {
    id: 'post-5',
    slug: 'writing-an-event-description-people-read',
    title: 'Writing an event description people actually read',
    excerpt:
      'Most descriptions are written for the organizer, not the attendee. A simple restructure fixes it.',
    cover: '/images/blog/blog-5.svg',
    category: 'Marketing',
    tags: ['copywriting', 'listings'],
    author: { name: 'Amara Diallo', role: 'Head of Organizer Success', avatar: '/images/avatars/avatar-1.svg' },
    publishedAt: daysAgo(29),
    body: [
      { type: 'p', text: 'Open with what happens, not with who you are. A reader deciding whether to spend an evening with you needs the shape of that evening before they need your founding story.' },
      { type: 'h2', text: 'Answer the four questions' },
      { type: 'p', text: 'What will I experience, who else will be there, what does it cost me in time and money, and what do I need to bring. Everything else is decoration.' },
      { type: 'h2', text: 'Cut the superlatives' },
      { type: 'p', text: 'Unmissable, world-class and unique are invisible to readers. A concrete detail — forty seats, one table, a menu written that morning — does the work that adjectives cannot.' },
    ],
  },
  {
    id: 'post-6',
    slug: 'managing-guest-lists-without-losing-your-mind',
    title: 'Managing guest lists without losing your mind',
    excerpt:
      'Comps, plus-ones, VIPs and last-minute additions — a workflow that keeps the door calm.',
    cover: '/images/blog/blog-6.svg',
    category: 'Organizer tips',
    tags: ['guest list', 'operations', 'check-in'],
    author: { name: 'Tomas Lindqvist', role: 'Product Manager', avatar: '/images/avatars/avatar-2.svg' },
    publishedAt: daysAgo(37),
    body: [
      { type: 'p', text: 'Guest lists go wrong in predictable ways: names added over text message, plus-ones nobody logged, and a door team discovering both at once.' },
      { type: 'h2', text: 'One list, one source' },
      { type: 'p', text: 'Issue comp tickets rather than keeping a separate spreadsheet. A comp is a real ticket with a real QR code, so the door treats it identically and your numbers stay honest.' },
      { type: 'h2', text: 'Close the list before doors' },
      { type: 'p', text: 'Set a hard cut-off an hour before doors and communicate it to everyone who can add names. Late additions go through one named person, and only that person.' },
    ],
  },
  {
    id: 'post-7',
    slug: 'accessibility-basics-for-event-organizers',
    title: 'Accessibility basics for event organizers',
    excerpt:
      'A short, practical checklist that covers most of what attendees need — and what to publish so they can decide for themselves.',
    cover: '/images/blog/blog-7.svg',
    category: 'Organizer tips',
    tags: ['accessibility', 'inclusion', 'planning'],
    author: { name: 'Priya Raman', role: 'Community Lead', avatar: '/images/avatars/avatar-3.svg' },
    publishedAt: daysAgo(44),
    body: [
      { type: 'p', text: 'The single most useful thing you can do is publish accurate access information. Attendees are experts in their own needs; they need facts, not reassurance.' },
      { type: 'h2', text: 'What to publish' },
      { type: 'p', text: 'Step-free routes, distance from the nearest accessible parking and transport, whether seating is available, toilet provision, lighting and sound conditions, and a named contact who can answer specifics.' },
      { type: 'h2', text: 'Companion tickets' },
      { type: 'p', text: 'Offer a free companion ticket as standard and say so on the listing. It costs you very little and removes a real barrier.' },
    ],
  },
  {
    id: 'post-8',
    slug: 'what-we-shipped-this-quarter',
    title: 'What we shipped this quarter',
    excerpt:
      'Multi-language listings, wallet refunds, a rebuilt scanner and a much faster events index.',
    cover: '/images/blog/blog-8.svg',
    category: 'Product',
    tags: ['changelog', 'release'],
    author: { name: 'Daniel Okoro', role: 'Payments', avatar: '/images/avatars/avatar-4.svg' },
    publishedAt: daysAgo(52),
    body: [
      { type: 'p', text: 'A round-up of everything that landed this quarter across the website, the organizer panel and the scanner app.' },
      { type: 'h2', text: 'Multi-language listings' },
      { type: 'p', text: 'Admins can now download a base translation file, translate it and upload it back. The website, organizer panel and admin panel all pick up the new locale.' },
      { type: 'h2', text: 'Wallet refunds' },
      { type: 'p', text: 'Refunds can be returned to the customer wallet instantly rather than waiting on the original payment channel, which cuts a common support thread to nothing.' },
      { type: 'h2', text: 'Rebuilt scanner' },
      { type: 'p', text: 'The scanner now validates fully offline and reconciles duplicate scans across devices when it reconnects.' },
    ],
  },
]

export const getPost = (slug) => posts.find((p) => p.slug === slug)
export const featuredPosts = () => posts.filter((p) => p.featured)
export const recentPosts = (limit = 3) =>
  [...posts].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)).slice(0, limit)
export const relatedPosts = (post, limit = 3) =>
  posts.filter((p) => p.id !== post.id && p.category === post.category).slice(0, limit)
