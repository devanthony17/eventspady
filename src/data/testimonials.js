/**
 * Production testimonials repository — clean initial state.
 * Client testimonials will be published through Admin CMS.
 */
export const testimonials = []

export const platformStats = []

/** Partner entities for trust marquees */
export const trustedOrganizers = [
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
    id: 'ghana-tourism',
    name: 'Ghana Tourism Authority',
    logo: '/images/organizers/logo-gta.svg',
    tag: 'Tourism & Culture',
  },
]

export const trustedBy = trustedOrganizers.map((o) => o.name)
