import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { SITE } from '@lib/constants'

/**
 * Per-page SEO: title, description, canonical, Open Graph, Twitter card
 * and optional JSON-LD structured data.
 */
export function Seo({
  title,
  description = SITE.description,
  image = SITE.ogImage,
  type = 'website',
  keywords,
  noIndex = false,
  jsonLd,
  children,
}) {
  const { pathname } = useLocation()
  const url = `${SITE.url}${pathname}`
  const fullTitle = title ? `${title} · ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`
  const absoluteImage = image?.startsWith('http') ? image : `${SITE.url}${image}`

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
      {children}
    </Helmet>
  )
}

/** schema.org/Event payload for an event detail page. */
export function eventJsonLd(event) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description?.[0],
    startDate: event.start,
    endDate: event.end,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode:
      event.type === 'online'
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
    image: [`${SITE.url}${event.cover}`],
    url: `${SITE.url}/events/${event.slug}`,
    location:
      event.type === 'online'
        ? { '@type': 'VirtualLocation', url: `${SITE.url}/events/${event.slug}` }
        : {
            '@type': 'Place',
            name: event.venue?.name,
            address: {
              '@type': 'PostalAddress',
              streetAddress: event.venue?.address,
              addressLocality: event.venue?.city,
              addressCountry: event.venue?.country,
            },
          },
    organizer: {
      '@type': 'Organization',
      name: event.organizer?.name,
      url: `${SITE.url}/organizers/${event.organizerId}`,
    },
    offers: event.tickets.map((t) => ({
      '@type': 'Offer',
      name: t.name,
      price: t.price,
      priceCurrency: t.currency,
      availability:
        t.remaining > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      url: `${SITE.url}/events/${event.slug}`,
      validThrough: t.salesEnd,
    })),
    aggregateRating: event.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: event.rating,
          reviewCount: event.reviewsCount,
        }
      : undefined,
  }
}

/** schema.org/BlogPosting payload for an article page. */
export function articleJsonLd(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: [`${SITE.url}${post.cover}`],
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Person', name: post.author.name },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: `${SITE.url}/images/logo.webp` },
    },
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
  }
}

/** schema.org/FAQPage payload built from grouped FAQ items. */
export function faqJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}
