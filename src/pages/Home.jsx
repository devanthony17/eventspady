import { Seo } from '@components/ui/Seo'
import { Hero } from '@components/home/Hero'
import { StatsStrip } from '@components/home/StatsStrip'
import { CategoryGrid } from '@components/home/CategoryGrid'
import { FeaturedEvents } from '@components/home/FeaturedEvents'
import { SpotlightBanner } from '@components/home/SpotlightBanner'
import { HowItWorks } from '@components/home/HowItWorks'
import { NearbyEvents } from '@components/home/NearbyEvents'
import { PlatformFeatures } from '@components/home/PlatformFeatures'
import { OrganizerCta } from '@components/home/OrganizerCta'
import { Testimonials } from '@components/home/Testimonials'
import { BlogPreview } from '@components/home/BlogPreview'
import { SITE } from '@lib/constants'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE.url}/events?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

export default function Home() {
  return (
    <>
      <Seo
        title={null}
        description={SITE.description}
        keywords="event booking, buy tickets, event management, QR check-in, sell tickets online, conferences, festivals"
        jsonLd={jsonLd}
      />

      <Hero />

      {/*
        Opaque and above the hero's fixed video layer, so everything from here
        down scrolls over it rather than letting it bleed through.
      */}
      <div className="relative z-10 bg-white dark:bg-ink-950">
        <StatsStrip />
        <CategoryGrid />
        <FeaturedEvents />
        <SpotlightBanner />
        <HowItWorks />
        <NearbyEvents />
        <PlatformFeatures />
        <OrganizerCta />
        <Testimonials />
        <BlogPreview />
      </div>
    </>
  )
}
