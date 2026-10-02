import { useState } from 'react'
import {
  Check,
  ExternalLink,
  Eye,
  FileEdit,
  LayoutTemplate,
  Plus,
  Quote,
  RefreshCw,
  RotateCcw,
  Save,
  Star,
  Trash2,
} from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { Input, Textarea } from '@components/ui/Field'
import { useStore } from '@context/StoreContext'
import { useToast } from '@context/ToastContext'
import {
  useAdminCms,
  useUpdateCmsHeroMutation,
  useUpdateCmsSpotlightMutation,
  useResetCmsMutation,
  useEvents,
} from '@hooks/api'
import { cn } from '@lib/utils'

export default function LandingPageCms() {
  const {
    cms: storeCms,
    events: storeEvents = [],
    updateHeroCms,
    updateSpotlightCms,
    addTestimonial,
    deleteTestimonial,
    addBlogPost,
    deleteBlogPost,
    resetCmsToDefaults,
  } = useStore()
  const { data: cmsData } = useAdminCms()
  const { data: eventsData } = useEvents()
  const updateHeroMutation = useUpdateCmsHeroMutation()
  const updateSpotlightMutation = useUpdateCmsSpotlightMutation()
  const resetCmsMutation = useResetCmsMutation()
  const toast = useToast()

  const cms = cmsData || storeCms
  const events = Array.isArray(eventsData)
    ? eventsData
    : Array.isArray(eventsData?.events)
      ? eventsData.events
      : Array.isArray(eventsData?.data)
        ? eventsData.data
        : eventsData !== undefined
          ? []
          : storeEvents

  const [activeTab, setActiveTab] = useState('hero') // 'hero' | 'spotlight' | 'reviews' | 'blog'

  // Local form states synced from context
  const [heroForm, setHeroForm] = useState({
    badge: cms?.hero?.badge || 'Wa · Upper West Region',
    titleLine1: cms?.hero?.titleLine1 || 'Find your next',
    titleHighlight: cms?.hero?.titleHighlight || 'unforgettable',
    titleLine2: cms?.hero?.titleLine2 || 'event',
    description:
      cms?.hero?.description ||
      'Festivals, conferences and community nights across Wa and the Upper West — book in seconds and walk in with a QR code on your phone.',
    primaryCtaText: cms?.hero?.primaryCtaText || 'Browse events',
    secondaryCtaText: cms?.hero?.secondaryCtaText || 'Create an event',
  })

  const [spotlightForm, setSpotlightForm] = useState({
    eventSlug: cms?.spotlight?.eventSlug || 'miss-dumba',
    badgeText: cms?.spotlight?.badgeText || 'Spotlight event',
    highlightNote: cms?.spotlight?.highlightNote || 'Limited VIP tables available',
  })

  // Testimonial modal / form state
  const [newReview, setNewReview] = useState({
    name: '',
    role: '',
    quote: '',
    rating: 5,
    avatar: '/images/avatars/avatar-2.svg',
  })
  const [showReviewModal, setShowReviewModal] = useState(false)

  // Blog modal / form state
  const [newBlog, setNewBlog] = useState({
    title: '',
    slug: '',
    excerpt: '',
    category: 'Guides',
    cover: '/images/events/bugatti-blackfriday.jpg',
    author: { name: 'Kofi Owusu', avatar: '/images/avatars/avatar-1.svg' },
    body: 'How organizers in Ghana can leverage mobile money USSD for instant payouts.',
  })
  const [showBlogModal, setShowBlogModal] = useState(false)

  const handleSaveHero = async (e) => {
    e.preventDefault()
    try {
      await updateHeroMutation.mutateAsync(heroForm)
    } catch {
      // Non-blocking fallback
    }
    updateHeroCms(heroForm)
    toast.success('Hero section updated! Changes are live on the homepage.')
  }

  const handleSaveSpotlight = async (e) => {
    e.preventDefault()
    try {
      await updateSpotlightMutation.mutateAsync(spotlightForm)
    } catch {
      // Non-blocking fallback
    }
    updateSpotlightCms(spotlightForm)
    toast.success('Spotlight banner updated! Changes are live on the homepage.')
  }

  const handleAddReview = (e) => {
    e.preventDefault()
    if (!newReview.name || !newReview.quote) {
      toast.error('Please fill in both name and quote.')
      return
    }
    addTestimonial(newReview)
    toast.success('Testimonial added to homepage!')
    setNewReview({
      name: '',
      role: '',
      quote: '',
      rating: 5,
      avatar: '/images/avatars/avatar-2.svg',
    })
    setShowReviewModal(false)
  }

  const handleDeleteReview = (id) => {
    deleteTestimonial(id)
    toast.info('Testimonial removed.')
  }

  const handleAddBlog = (e) => {
    e.preventDefault()
    if (!newBlog.title || !newBlog.excerpt) {
      toast.error('Please enter title and excerpt.')
      return
    }
    const slug = newBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    addBlogPost({ ...newBlog, slug })
    toast.success('Blog post published to homepage!')
    setNewBlog({
      title: '',
      slug: '',
      excerpt: '',
      category: 'Guides',
      cover: '/images/events/bugatti-blackfriday.jpg',
      author: { name: 'Kofi Owusu', avatar: '/images/avatars/avatar-1.svg' },
      body: 'How organizers in Ghana can leverage mobile money USSD for instant payouts.',
    })
    setShowBlogModal(false)
  }

  const handleDeleteBlog = (id) => {
    deleteBlogPost(id)
    toast.info('Blog article removed.')
  }

  const handleResetDefaults = async () => {
    if (window.confirm('Reset all landing page sections (Hero, Spotlight, Reviews, Blogs) to default content?')) {
      try {
        await resetCmsMutation.mutateAsync()
      } catch {
        // Non-blocking fallback
      }
      resetCmsToDefaults()
      toast.success('Landing page content reset to defaults.')
      // Refresh local states
      setTimeout(() => window.location.reload(), 300)
    }
  }

  return (
    <>
      <Seo
        title="Landing Page CMS Management — Admin Console"
        description="Dynamically edit homepage hero, spotlight event, reviews, and blog previews."
        noIndex
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-3xl">
              Landing Page CMS
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-ink-500 dark:text-ink-400">
              Update marketing copy, spotlight features, customer reviews and blog articles with immediate live reflection.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-xs font-medium text-ink-600 shadow-xs transition hover:bg-ink-50 dark:border-white/10 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset to Defaults</span>
            </button>
            <Button
              to="/"
              target="_blank"
              size="sm"
              iconRight={ExternalLink}
              className="flex-1 sm:flex-initial justify-center"
            >
              Preview Public Site
            </Button>
          </div>
        </div>

        {/* Responsive Section Navigation Bar */}
        <div className="space-y-2">
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 px-1 rounded-xl bg-ink-100/80 dark:bg-white/[.04] border border-ink-200/80 dark:border-white/10 scroll-smooth">
              {[
                {
                  id: 'hero',
                  num: '1',
                  shortLabel: 'Hero',
                  fullLabel: 'Hero Section',
                  icon: LayoutTemplate,
                },
                {
                  id: 'spotlight',
                  num: '2',
                  shortLabel: 'Spotlight',
                  fullLabel: 'Spotlight Event',
                  icon: Star,
                },
                {
                  id: 'reviews',
                  num: '3',
                  shortLabel: 'Reviews',
                  fullLabel: 'Reviews & Testimonials',
                  icon: Quote,
                  badge: cms?.testimonials?.length || 0,
                },
                {
                  id: 'blog',
                  num: '4',
                  shortLabel: 'Blog',
                  fullLabel: 'Blog Highlights',
                  icon: FileEdit,
                  badge: cms?.blogPosts?.length || 0,
                },
              ].map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'group flex items-center gap-2 rounded-lg px-3 py-2 sm:px-3.5 sm:py-2 text-xs font-medium transition-all shrink-0 select-none',
                      isActive
                        ? 'bg-white text-brand-700 shadow-xs ring-1 ring-ink-200/60 dark:bg-ink-800 dark:text-white dark:ring-white/15'
                        : 'text-ink-600 hover:bg-white/60 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-white/[.06] dark:hover:text-white',
                    )}
                  >
                    <tab.icon className="size-3.5 shrink-0" />

                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className="inline sm:hidden">{tab.shortLabel}</span>
                      <span className="hidden sm:inline">{tab.fullLabel}</span>
                    </span>

                    {tab.badge != null && (
                      <span
                        className={cn(
                          'rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-none transition-colors',
                          isActive
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/25 dark:text-brand-300'
                            : 'bg-ink-200/70 text-ink-600 dark:bg-white/10 dark:text-ink-400',
                        )}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick Section Hint on Mobile */}
          <div className="flex items-center justify-between px-1 text-[11px] text-ink-400 sm:hidden">
            <span>Swipe tabs to switch sections</span>
            <span className="font-semibold text-brand-600 dark:text-brand-400">
              Active: {activeTab === 'hero' ? 'Hero' : activeTab === 'spotlight' ? 'Spotlight' : activeTab === 'reviews' ? 'Reviews' : 'Blog'}
            </span>
          </div>
        </div>

        {/* TAB 1: HERO SECTION */}
        {activeTab === 'hero' && (
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
            {/* Form */}
            <form onSubmit={handleSaveHero} className="surface space-y-4 p-5 sm:p-7">
              <h3 className="text-base font-black text-ink-900 dark:text-white">
                Edit Hero Section Copy
              </h3>

              <Input
                label="Location Badge"
                value={heroForm.badge}
                onChange={(e) => setHeroForm({ ...heroForm, badge: e.target.value })}
                placeholder="e.g. Wa · Upper West Region"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Title Line 1"
                  value={heroForm.titleLine1}
                  onChange={(e) => setHeroForm({ ...heroForm, titleLine1: e.target.value })}
                  placeholder="e.g. Find your next"
                />
                <Input
                  label="Title Highlight (Gradient)"
                  value={heroForm.titleHighlight}
                  onChange={(e) => setHeroForm({ ...heroForm, titleHighlight: e.target.value })}
                  placeholder="e.g. unforgettable"
                />
              </div>

              <Input
                label="Title Line 2"
                value={heroForm.titleLine2}
                onChange={(e) => setHeroForm({ ...heroForm, titleLine2: e.target.value })}
                placeholder="e.g. event"
              />

              <Textarea
                label="Hero Description"
                rows={3}
                value={heroForm.description}
                onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                placeholder="Description copy..."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Primary Button Text"
                  value={heroForm.primaryCtaText}
                  onChange={(e) => setHeroForm({ ...heroForm, primaryCtaText: e.target.value })}
                  placeholder="Browse events"
                />
                <Input
                  label="Secondary Button Text"
                  value={heroForm.secondaryCtaText}
                  onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaText: e.target.value })}
                  placeholder="Create an event"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" size="md" iconLeft={Save} className="w-full sm:w-auto justify-center">
                  Save & Publish Hero Changes
                </Button>
              </div>
            </form>

            {/* Real-time Hero Preview Card */}
            <div className="flex flex-col">
              <h4 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-ink-400">
                Live Rendering Preview
              </h4>
              <div className="relative flex-1 overflow-hidden rounded-3xl bg-ink-950 p-5 sm:p-7 md:p-8 text-white shadow-2xl flex flex-col justify-center min-h-[280px]">
                <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-ink-900 to-brand-950 opacity-90" />
                <div className="relative z-10 space-y-4">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur-md">
                    {heroForm.badge}
                  </span>

                  <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                    {heroForm.titleLine1}{' '}
                    <span className="bg-gradient-to-r from-brand-200 via-white to-accent-300 bg-clip-text text-transparent">
                      {heroForm.titleHighlight}
                    </span>{' '}
                    {heroForm.titleLine2}
                  </h1>

                  <p className="text-xs text-white/70 leading-relaxed max-w-md">
                    {heroForm.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    <span className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-lift">
                      {heroForm.primaryCtaText || 'Browse events'}
                    </span>
                    <span className="rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold text-white">
                      {heroForm.secondaryCtaText || 'Create an event'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SPOTLIGHT EVENT */}
        {activeTab === 'spotlight' && (
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
            <form onSubmit={handleSaveSpotlight} className="surface space-y-4 p-5 sm:p-7">
              <h3 className="text-base font-black text-ink-900 dark:text-white">
                Spotlight Event Selector
              </h3>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                Select which event takes center stage in the countdown banner on the homepage.
              </p>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink-700 dark:text-ink-300">
                  Featured Event
                </label>
                <select
                  value={spotlightForm.eventSlug}
                  onChange={(e) => setSpotlightForm({ ...spotlightForm, eventSlug: e.target.value })}
                  className="w-full rounded-xl border border-ink-200 bg-white p-3 text-xs sm:text-sm text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white"
                >
                  {events.map((ev) => (
                    <option key={ev.slug} value={ev.slug}>
                      {ev.title} ({ev.venue?.city || 'Wa'}) — Starts {ev.start?.split('T')[0]}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Spotlight Badge Text"
                value={spotlightForm.badgeText}
                onChange={(e) => setSpotlightForm({ ...spotlightForm, badgeText: e.target.value })}
                placeholder="e.g. Spotlight event"
              />

              <Input
                label="Highlight / Special Note"
                value={spotlightForm.highlightNote}
                onChange={(e) => setSpotlightForm({ ...spotlightForm, highlightNote: e.target.value })}
                placeholder="e.g. Fast selling — 85% capacity reached"
              />

              <div className="pt-2">
                <Button type="submit" size="md" iconLeft={Save} className="w-full sm:w-auto justify-center">
                  Save & Publish Spotlight
                </Button>
              </div>
            </form>

            {/* Spotlight Preview */}
            <div className="flex flex-col">
              <h4 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-ink-400">
                Live Spotlight Card Preview
              </h4>
              {(() => {
                const currentEvent = events.find((e) => e.slug === spotlightForm.eventSlug) || events[0]
                return (
                  <div className="relative flex-1 overflow-hidden rounded-3xl bg-ink-950 p-5 sm:p-7 text-white shadow-2xl flex flex-col justify-between min-h-[300px]">
                    <img
                      src={currentEvent?.cover}
                      alt=""
                      className="absolute inset-0 size-full object-cover opacity-35"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/90 to-transparent" />

                    <div className="relative z-10 space-y-3">
                      <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                        {spotlightForm.badgeText}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black">{currentEvent?.title}</h3>
                      <p className="text-xs text-white/70 max-w-sm line-clamp-2">
                        {currentEvent?.tagline}
                      </p>
                      <p className="text-xs font-bold text-accent-300">
                        📍 {currentEvent?.venue?.name}, {currentEvent?.venue?.city}
                      </p>
                    </div>

                    <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-xs text-white/70">
                      <span>{spotlightForm.highlightNote}</span>
                      <span className="font-extrabold text-white">Tickets available now</span>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* TAB 3: TESTIMONIALS / REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-ink-900 dark:text-white">
                  Customer & Organizer Reviews
                </h3>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  Manage quotes and ratings displayed in the trusted organizers marquee section.
                </p>
              </div>
              <Button size="sm" iconLeft={Plus} onClick={() => setShowReviewModal(true)} className="w-full sm:w-auto justify-center">
                Add Testimonial
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(cms?.testimonials || []).map((t) => (
                <div
                  key={t.id}
                  className="surface relative flex flex-col justify-between p-5 transition hover:shadow-card"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: t.rating || 5 }).map((_, i) => (
                          <Star key={i} className="size-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(t.id)}
                        className="grid size-7 place-items-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 active:scale-90 transition"
                        title="Delete review"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <blockquote className="mt-3 text-xs leading-relaxed text-ink-700 dark:text-ink-200">
                      “{t.quote}”
                    </blockquote>
                  </div>

                  <div className="mt-4 flex items-center gap-3 border-t border-ink-100 pt-3 dark:border-white/10">
                    <img src={t.avatar} alt={t.name} className="size-8 rounded-full bg-ink-200 object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-ink-900 dark:text-white">{t.name}</p>
                      <p className="truncate text-[10px] text-ink-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Review Modal */}
            {showReviewModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                <div
                  className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm"
                  onClick={() => setShowReviewModal(false)}
                />
                <form
                  onSubmit={handleAddReview}
                  className="relative w-full max-w-lg rounded-3xl bg-white p-5 sm:p-7 shadow-2xl dark:bg-ink-900 space-y-4 max-h-[92vh] overflow-y-auto"
                >
                  <h3 className="text-lg font-black text-ink-900 dark:text-white">
                    Add New Testimonial
                  </h3>

                  <Input
                    label="Author Name"
                    required
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    placeholder="e.g. Hajia Mariama"
                  />

                  <Input
                    label="Role / Organization"
                    required
                    value={newReview.role}
                    onChange={(e) => setNewReview({ ...newReview, role: e.target.value })}
                    placeholder="e.g. Organizer, Dumba Festival"
                  />

                  <Textarea
                    label="Testimonial Quote"
                    required
                    rows={3}
                    value={newReview.quote}
                    onChange={(e) => setNewReview({ ...newReview, quote: e.target.value })}
                    placeholder="What did they say about Eventspady?"
                  />

                  <div className="flex items-center gap-4">
                    <label className="text-xs font-bold text-ink-700 dark:text-ink-300">Rating:</label>
                    <select
                      value={newReview.rating}
                      onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                      className="rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-xs font-bold dark:border-white/10 dark:bg-ink-800"
                    >
                      <option value={5}>5 Stars (Exceptional)</option>
                      <option value={4}>4 Stars (Very Good)</option>
                    </select>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-3">
                    <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setShowReviewModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="md" className="w-full sm:w-auto">
                      Publish Review
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BLOG ARTICLES */}
        {activeTab === 'blog' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-ink-900 dark:text-white">
                  Homepage Blog Previews
                </h3>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  Publish and manage insightful articles for event organizers and attendees.
                </p>
              </div>
              <Button size="sm" iconLeft={Plus} onClick={() => setShowBlogModal(true)} className="w-full sm:w-auto justify-center">
                Publish New Article
              </Button>
            </div>

            <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(cms?.blogPosts || []).map((post) => (
                <article
                  key={post.id}
                  className="surface flex flex-col overflow-hidden rounded-2xl transition hover:shadow-card"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink-100 dark:bg-white/10">
                    <img
                      src={post.cover}
                      alt={post.title}
                      className="size-full object-cover"
                    />
                    <div className="absolute right-2 top-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteBlog(post.id)}
                        className="grid size-7 place-items-center rounded-lg bg-ink-900/80 text-white backdrop-blur-sm hover:bg-rose-600 active:scale-90 transition"
                        title="Delete article"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {post.category || 'Guides'}
                    </span>
                    <h4 className="mt-1 font-bold text-ink-900 dark:text-white line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="mt-1 flex-1 text-xs text-ink-500 dark:text-ink-400 line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="mt-3 flex items-center gap-2 border-t border-ink-100 pt-2.5 text-[11px] text-ink-400 dark:border-white/10">
                      <span>By {post.author?.name || 'Admin'}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Add Blog Modal */}
            {showBlogModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                <div
                  className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm"
                  onClick={() => setShowBlogModal(false)}
                />
                <form
                  onSubmit={handleAddBlog}
                  className="relative w-full max-w-lg rounded-3xl bg-white p-5 sm:p-7 shadow-2xl dark:bg-ink-900 space-y-4 max-h-[92vh] overflow-y-auto"
                >
                  <h3 className="text-lg font-black text-ink-900 dark:text-white">
                    Publish New Blog Article
                  </h3>

                  <Input
                    label="Article Title"
                    required
                    value={newBlog.title}
                    onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                    placeholder="e.g. How to Host a Sold-Out Concert in Wa"
                  />

                  <Input
                    label="Category"
                    value={newBlog.category}
                    onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
                    placeholder="e.g. Guides, Technology, Case Studies"
                  />

                  <Textarea
                    label="Short Excerpt / Teaser"
                    required
                    rows={2}
                    value={newBlog.excerpt}
                    onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                    placeholder="Summary visible on the homepage preview..."
                  />

                  <Input
                    label="Cover Image Path"
                    value={newBlog.cover}
                    onChange={(e) => setNewBlog({ ...newBlog, cover: e.target.value })}
                    placeholder="/images/events/bugatti-blackfriday.jpg"
                  />

                  <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-3">
                    <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setShowBlogModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="md" className="w-full sm:w-auto">
                      Publish to Homepage
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
