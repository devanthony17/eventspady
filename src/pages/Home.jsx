import { useMemo } from 'react'
import { Seo } from '@components/ui/Seo'
import { AnnouncementBanner } from '@components/home/AnnouncementBanner'
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
import { CustomCmsSection } from '@components/home/CustomCmsSection'
import { useLandingCms } from '@hooks/api'
import { useStore } from '@context/StoreContext'
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
  const { data: cmsData } = useLandingCms()
  const { cms: storeCms } = useStore()

  const cms = useMemo(() => {
    return cmsData || storeCms || {}
  }, [cmsData, storeCms])

  const sections = cms?.sections || {
    stats: true,
    categories: true,
    featured: true,
    spotlight: true,
    howItWorks: true,
    nearby: true,
    features: true,
    organizerCta: true,
    testimonials: true,
    blog: true,
  }

  const customSections = Array.isArray(cms?.customSections) ? cms.customSections : []

  return (
    <>
      <Seo
        title={null}
        description={SITE.description}
        keywords="event booking, buy tickets, event management, QR check-in, sell tickets online, conferences, festivals"
        jsonLd={jsonLd}
      />

      {/* Admin CMS Top Announcement Banner */}
      <AnnouncementBanner announcement={cms?.announcement} />

      <Hero />

      {/*
        Opaque and above the hero's fixed video layer, so everything from here
        down scrolls over it rather than letting it bleed through.
      */}
      <div className="relative z-10 bg-white dark:bg-ink-950">
        {sections.stats !== false && <StatsStrip />}
        {sections.categories !== false && <CategoryGrid />}
        {sections.featured !== false && <FeaturedEvents />}
        {sections.spotlight !== false && <SpotlightBanner />}
        {sections.howItWorks !== false && <HowItWorks />}

        {/* Dynamic Custom Sections added via Admin CMS */}
        {customSections.map((section) => (
          <CustomCmsSection key={section.id} section={section} />
        ))}

        {sections.nearby !== false && <NearbyEvents />}
        {sections.features !== false && <PlatformFeatures />}
        {sections.organizerCta !== false && <OrganizerCta />}
        {sections.testimonials !== false && <Testimonials />}
        {sections.blog !== false && <BlogPreview />}
      </div>
    </>
  )
}
