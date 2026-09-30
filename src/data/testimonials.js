export const testimonials = [
  {
    id: 't1',
    quote:
      'We moved the whole Dumba programme onto Eventspady last season. The palace gate used to take an hour to clear; now it is under twenty minutes and I can see the live count from my phone.',
    name: 'Alhaji Mumuni Bakuri',
    role: 'Programme Director, Wa Naa Cultural Trust',
    avatar: '/images/avatars/avatar-alhaj-mumuni.jpg',
    rating: 5,
  },
  {
    id: 't2',
    quote:
      'Mobile money at checkout was the whole thing for us. Nearly nine in ten of our attendees pay with MoMo — the moment that worked properly, our advance sales doubled.',
    name: 'Abena Sowah',
    role: 'Operations, UBIDS Innovation Hub',
    avatar: '/images/avatars/avatar-abena-sowah.jpg',
    rating: 5,
  },
  {
    id: 't3',
    quote:
      'Cash at the door still matters here. Half our community crowd pays on the night and the scanner settles it without holding up the queue behind them.',
    name: 'Sulemana Iddrisu',
    role: 'Coordinator, Jirapa Arts Collective',
    avatar: '/images/avatars/avatar-sulemana-iddrisu.jpg',
    rating: 5,
  },
  {
    id: 't4',
    quote:
      'As someone just buying tickets, I mostly notice that nothing goes wrong. The QR arrives on MoMo confirmation and it works at the gate every time.',
    name: 'Gifty Bawa',
    role: 'Regular attendee, Wa',
    avatar: '/images/avatars/avatar-gifty-bawa.jpg',
    rating: 5,
  },
  {
    id: 't5',
    quote:
      'We run our listings in English and Dagaare. The translation upload took an afternoon and now our farmers’ programme reaches people who were never going to read an English page.',
    name: 'Paulina Kuu-ire',
    role: 'Director, Nandom Community Radio',
    avatar: '/images/avatars/avatar-paulina-kuu-ire.jpg',
    rating: 4,
  },
  {
    id: 't6',
    quote:
      'The payout breakdown per order is the clearest I have used. Commission, VAT and refunds all itemised, so reconciling with the Assembly stopped being an argument.',
    name: 'Eric Naah',
    role: 'Finance, Savannah Esports GH',
    avatar: '/images/avatars/avatar-eric-naah.jpg',
    rating: 5,
  },
]

export const platformStats = [
  { label: 'Tickets issued', value: 186000, suffix: '+' },
  { label: 'Events hosted', value: 3400, suffix: '+' },
  { label: 'Active organizers', value: 640, suffix: '+' },
  { label: 'Districts covered', value: 11, suffix: '' },
]

/** Organizer partners with verified vector logo assets for the trust marquee strip. */
export const trustedOrganizers = [
  {
    id: 'wa-naa-cultural',
    name: 'Wa Naa Palace Cultural Trust',
    logo: '/images/organizers/logo-wa-naa.svg',
    tag: 'Cultural Authority',
  },
  {
    id: 'ubids-innovation',
    name: 'SD Dombo UBIDS',
    logo: '/images/organizers/logo-ubids.svg',
    tag: 'Academic & Tech',
  },
  {
    id: 'royal-cosy-hills',
    name: 'Royal Cosy Hills (Jirapa Dubai)',
    logo: '/images/organizers/logo-royal-cosy-hills.svg',
    tag: 'Safari Resort',
  },
  {
    id: 'mtn-momo',
    name: 'MTN Mobile Money',
    logo: '/images/organizers/logo-mtn-momo.svg',
    tag: 'Payment Partner',
  },
  {
    id: 'telecel-cash',
    name: 'Telecel Cash',
    logo: '/images/organizers/logo-telecel.svg',
    tag: 'Instant Settlements',
  },
  {
    id: 'savannah-hub',
    name: 'Savannah Tech Hub',
    logo: '/images/organizers/logo-savannah-hub.svg',
    tag: 'Innovation & Tech',
  },
  {
    id: 'ghana-tourism',
    name: 'Ghana Tourism Authority',
    logo: '/images/organizers/logo-gta.svg',
    tag: 'Tourism & Culture',
  },
  {
    id: 'bugatti-lounge',
    name: 'Bugatti Lounge & Club',
    logo: '/images/organizers/logo-bugatti.svg',
    tag: 'Nightlife & Events',
  },
  {
    id: 'sombo-sound',
    name: 'Sombo Sound Collective',
    logo: '/images/organizers/logo-sombo-sound.svg',
    tag: 'Festivals & Concerts',
  },
  {
    id: 'wechiau-sanctuary',
    name: 'Wechiau Hippo Sanctuary',
    logo: '/images/organizers/logo-wechiau.svg',
    tag: 'Eco-Tourism',
  },
  {
    id: 'jonjo-palace',
    name: 'Jonjo Palace',
    logo: '/images/organizers/logo-jonjo.svg',
    tag: 'Sports & Fitness',
  },
  {
    id: 'arts-council',
    name: 'UW Arts & Heritage Council',
    logo: '/images/organizers/logo-arts-council.svg',
    tag: 'Arts & Heritage',
  },
]

export const trustedBy = trustedOrganizers.map((o) => o.name)
