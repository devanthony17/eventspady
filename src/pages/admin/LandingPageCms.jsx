import { useState, useRef, useMemo, useEffect } from 'react'
import {
  BarChart3,
  Check,
  ExternalLink,
  Eye,
  FileEdit,
  FolderOpen,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  LayoutTemplate,
  Megaphone,
  Pencil,
  Plus,
  Quote,
  RefreshCw,
  RotateCcw,
  Save,
  Sliders,
  Sparkles,
  Star,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { Input, Textarea, Select } from '@components/ui/Field'
import { useStore } from '@context/StoreContext'
import { useToast } from '@context/ToastContext'
import {
  useAdminCms,
  useUpdateCmsHeroMutation,
  useUpdateCmsSpotlightMutation,
  useResetCmsMutation,
  useEvents,
  useCreateCmsTestimonialMutation,
  useUpdateCmsTestimonialMutation,
  useDeleteCmsTestimonialMutation,
  useCreateCmsBlogPostMutation,
  useUpdateCmsBlogPostMutation,
  useDeleteCmsBlogPostMutation,
  useUpdateCmsAnnouncementMutation,
  useUpdateCmsStatsMutation,
  useUpdateCmsSectionsMutation,
  useCreateCmsCustomSectionMutation,
  useUpdateCmsCustomSectionMutation,
  useDeleteCmsCustomSectionMutation,
} from '@hooks/api'
import { cn } from '@lib/utils'

export default function LandingPageCms() {
  const {
    cms: storeCms,
    events: storeEvents = [],
    updateHeroCms,
    updateSpotlightCms,
    updateAnnouncementCms,
    updateStatsCms,
    updateSectionsCms,
    addCustomSection,
    updateCustomSection,
    deleteCustomSection,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    resetCmsToDefaults,
  } = useStore()
  const { data: cmsData } = useAdminCms()
  const { data: eventsData } = useEvents()
  const updateHeroMutation = useUpdateCmsHeroMutation()
  const updateSpotlightMutation = useUpdateCmsSpotlightMutation()
  const resetCmsMutation = useResetCmsMutation()
  const createTestimonialMutation = useCreateCmsTestimonialMutation()
  const updateTestimonialMutation = useUpdateCmsTestimonialMutation()
  const deleteTestimonialMutation = useDeleteCmsTestimonialMutation()
  const createBlogPostMutation = useCreateCmsBlogPostMutation()
  const updateBlogPostMutation = useUpdateCmsBlogPostMutation()
  const deleteBlogPostMutation = useDeleteCmsBlogPostMutation()
  const updateAnnouncementMutation = useUpdateCmsAnnouncementMutation()
  const updateStatsMutation = useUpdateCmsStatsMutation()
  const updateSectionsMutation = useUpdateCmsSectionsMutation()
  const createCustomSectionMutation = useCreateCmsCustomSectionMutation()
  const updateCustomSectionMutation = useUpdateCmsCustomSectionMutation()
  const deleteCustomSectionMutation = useDeleteCmsCustomSectionMutation()
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

  const [activeTab, setActiveTab] = useState('hero') // 'hero' | 'spotlight' | 'reviews' | 'blog' | 'sections' | 'stats'

  // Local form states synced from context
  const [heroForm, setHeroForm] = useState({
    badge: cms?.hero?.badge || cms?.hero?.badgeText || 'Wa · Upper West Region',
    titleLine1: cms?.hero?.titleLine1 || 'Find your next',
    titleHighlight: cms?.hero?.titleHighlight || cms?.hero?.gradientText || 'unforgettable',
    titleLine2: cms?.hero?.titleLine2 || 'event',
    description:
      cms?.hero?.description ||
      'Festivals, conferences and community nights across Wa and the Upper West — book in seconds and walk in with a QR code on your phone.',
    primaryCtaText: cms?.hero?.primaryCtaText || cms?.hero?.ctaPrimaryText || 'Browse events',
    secondaryCtaText: cms?.hero?.secondaryCtaText || cms?.hero?.ctaSecondaryText || 'Create an event',
  })

  // Spotlight form state & file input
  const [spotlightForm, setSpotlightForm] = useState({
    eventSlug: cms?.spotlight?.eventSlug || (events && events[0]?.slug) || '',
    badgeText: cms?.spotlight?.badgeText || cms?.spotlight?.customBadge || 'Spotlight event',
    highlightNote: cms?.spotlight?.highlightNote || cms?.spotlight?.customTagline || '',
    customImage: cms?.spotlight?.customImage || cms?.spotlight?.image || cms?.spotlight?.cover || '',
  })

  // Announcement state
  const [announcementForm, setAnnouncementForm] = useState({
    enabled: cms?.announcement?.enabled || false,
    text: cms?.announcement?.text || '',
    badge: cms?.announcement?.badge || 'Announcement',
    link: cms?.announcement?.link || '',
    linkText: cms?.announcement?.linkText || 'Learn more',
  })

  // Sections toggle state
  const [sectionsForm, setSectionsForm] = useState(
    cms?.sections || {
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
    },
  )

  // Custom section modal states
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const [sectionForm, setSectionForm] = useState({
    title: '',
    eyebrow: '',
    description: '',
    layout: 'cards', // 'cards' | 'banner' | 'split'
    tone: 'light', // 'light' | 'dark' | 'brand'
    ctaText: '',
    ctaLink: '',
    image: '',
    items: [],
  })
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemDesc, setNewItemDesc] = useState('')

  // Milestone stats modal / state
  const [showStatModal, setShowStatModal] = useState(false)
  const [editingStatIndex, setEditingStatIndex] = useState(null)
  const [statForm, setStatForm] = useState({ value: '', suffix: '+', label: '' })

  // Keep form fields synced when CMS data loads or updates
  useEffect(() => {
    if (cms?.hero) {
      setHeroForm((prev) => ({
        ...prev,
        badge: cms.hero.badge || cms.hero.badgeText || prev.badge,
        titleLine1: cms.hero.titleLine1 || prev.titleLine1,
        titleHighlight: cms.hero.titleHighlight || cms.hero.gradientText || prev.titleHighlight,
        titleLine2: cms.hero.titleLine2 || prev.titleLine2,
        description: cms.hero.description || prev.description,
        primaryCtaText: cms.hero.primaryCtaText || cms.hero.ctaPrimaryText || prev.primaryCtaText,
        secondaryCtaText: cms.hero.secondaryCtaText || cms.hero.ctaSecondaryText || prev.secondaryCtaText,
      }))
    }
    if (cms?.spotlight) {
      setSpotlightForm((prev) => ({
        ...prev,
        eventSlug: cms.spotlight.eventSlug || prev.eventSlug,
        badgeText: cms.spotlight.badgeText || cms.spotlight.customBadge || prev.badgeText,
        highlightNote: cms.spotlight.highlightNote || cms.spotlight.customTagline || prev.highlightNote,
        customImage: cms.spotlight.customImage || cms.spotlight.image || cms.spotlight.cover || prev.customImage,
      }))
    }
    if (cms?.announcement) {
      setAnnouncementForm({
        enabled: Boolean(cms.announcement.enabled),
        text: cms.announcement.text || '',
        badge: cms.announcement.badge || 'Announcement',
        link: cms.announcement.link || '',
        linkText: cms.announcement.linkText || 'Learn more',
      })
    }
    if (cms?.sections) {
      setSectionsForm((prev) => ({ ...prev, ...cms.sections }))
    }
  }, [cms])

  const [showSpotlightMediaModal, setShowSpotlightMediaModal] = useState(false)
  const spotlightFileInputRef = useRef(null)

  // Media Library presets extracted from catalog
  const mediaLibrary = useMemo(() => {
    const list = []
    const seen = new Set()
    events.forEach((ev) => {
      if (ev.cover && !seen.has(ev.cover)) {
        seen.add(ev.cover)
        list.push({ src: ev.cover, title: ev.title, category: ev.category || 'Events' })
      }
    })
    const extraPresets = [
      { src: '/images/events/miss-dumba.jpg', title: 'Miss Dumba Pageant', category: 'Culture' },
      { src: '/images/events/dumba-festival.jpg', title: 'Dumba Grand Durbar', category: 'Culture' },
      { src: '/images/events/bugatti-blackfriday.jpg', title: 'Black Friday Concert', category: 'Music' },
      { src: '/images/events/savannah-devcon.jpg', title: 'Savannah DevCon', category: 'Tech' },
      { src: '/images/events/wa-city-marathon.jpg', title: 'Wa City Marathon', category: 'Sports' },
      { src: '/images/events/nandom-pottery.jpg', title: 'Nandom Pottery Workshop', category: 'Art' },
      { src: '/images/events/wechiau-safari.jpg', title: 'Wechiau Safari Tour', category: 'Travel' },
      { src: '/images/events/all-white-party.jpg', title: 'All White Night Party', category: 'Nightlife' },
    ]
    extraPresets.forEach((p) => {
      if (!seen.has(p.src)) {
        seen.add(p.src)
        list.push(p)
      }
    })
    return list
  }, [events])

  // Testimonial modal / form states
  const [newReview, setNewReview] = useState({
    name: '',
    role: '',
    quote: '',
    rating: 5,
    avatar: '/images/avatars/avatar-abena-sowah.jpg',
  })
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const newReviewAvatarInputRef = useRef(null)
  const editReviewAvatarInputRef = useRef(null)

  // Avatar presets for quick testimonial picker
  const avatarPresets = [
    { src: '/images/avatars/avatar-abena-sowah.jpg', label: 'Abena Sowah' },
    { src: '/images/avatars/avatar-eric-naah.jpg', label: 'Eric Naah' },
    { src: '/images/avatars/avatar-alhaj-mumuni.jpg', label: 'Alhaj Mumuni' },
    { src: '/images/avatars/avatar-gifty-bawa.jpg', label: 'Gifty Bawa' },
    { src: '/images/avatars/avatar-paulina-kuu-ire.jpg', label: 'Paulina Kuu-Ire' },
    { src: '/images/avatars/avatar-sulemana-iddrisu.jpg', label: 'Sulemana Iddrisu' },
  ]

  // Blog modal / form states
  const [newBlog, setNewBlog] = useState({
    title: '',
    slug: '',
    excerpt: '',
    category: 'Guides',
    cover: '/images/events/bugatti-blackfriday.jpg',
    author: { name: 'Kofi Owusu', avatar: '/images/avatars/avatar-eric-naah.jpg' },
    body: 'How organizers in Ghana can leverage mobile money USSD for instant payouts.',
  })
  const [showBlogModal, setShowBlogModal] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const newBlogCoverInputRef = useRef(null)
  const editBlogCoverInputRef = useRef(null)

  // Blog cover presets for quick picker
  const blogCoverPresets = [
    { src: '/images/blog/blog-festival-playbook.jpg', label: 'Festival Playbook' },
    { src: '/images/blog/blog-momo-payments.jpg', label: 'MoMo Payments' },
    { src: '/images/blog/blog-outdoor-venue.jpg', label: 'Outdoor Venues' },
    { src: '/images/blog/blog-qr-scanner-gate.jpg', label: 'QR Scanner Gate' },
    { src: '/images/events/savannah-devcon.jpg', label: 'Conference' },
    { src: '/images/events/miss-dumba.jpg', label: 'Pageant' },
  ]

  // Reusable File Reader helper for drag & drop and file selection
  const handleReadFile = (file, onSuccess) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WebP, etc.).')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      onSuccess(e.target.result)
    }
    reader.onerror = () => {
      toast.error('Failed to read image file from device.')
    }
    reader.readAsDataURL(file)
  }

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
    const payload = {
      ...spotlightForm,
      image: spotlightForm.customImage,
      cover: spotlightForm.customImage,
    }
    try {
      await updateSpotlightMutation.mutateAsync(payload)
    } catch {
      // Non-blocking fallback
    }
    updateSpotlightCms(payload)
    toast.success('Spotlight banner updated! Changes are live on the homepage.')
  }

  const handleAddReview = async (e) => {
    e.preventDefault()
    if (!newReview.name || !newReview.quote) {
      toast.error('Please fill in both name and quote.')
      return
    }
    try {
      await createTestimonialMutation.mutateAsync(newReview)
    } catch {
      // Non-blocking fallback
    }
    addTestimonial(newReview)
    toast.success('Testimonial added to homepage!')
    setNewReview({
      name: '',
      role: '',
      quote: '',
      rating: 5,
      avatar: '/images/avatars/avatar-abena-sowah.jpg',
    })
    setShowReviewModal(false)
  }

  const handleUpdateReview = async (e) => {
    e.preventDefault()
    if (!editingReview.name || !editingReview.quote) {
      toast.error('Please fill in both name and quote.')
      return
    }
    try {
      await updateTestimonialMutation.mutateAsync(editingReview)
    } catch {
      // Non-blocking fallback
    }
    updateTestimonial(editingReview.id, editingReview)
    toast.success('Testimonial updated! Changes reflect live on the homepage.')
    setEditingReview(null)
  }

  const handleDeleteReview = async (id) => {
    try {
      await deleteTestimonialMutation.mutateAsync(id)
    } catch {
      // Non-blocking fallback
    }
    deleteTestimonial(id)
    toast.info('Testimonial removed.')
  }

  const handleAddBlog = async (e) => {
    e.preventDefault()
    if (!newBlog.title || !newBlog.excerpt) {
      toast.error('Please enter title and excerpt.')
      return
    }
    const slug = newBlog.slug || newBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const payload = { ...newBlog, slug }
    try {
      await createBlogPostMutation.mutateAsync(payload)
    } catch {
      // Non-blocking fallback
    }
    addBlogPost(payload)
    toast.success('Blog post published to homepage & blog!')
    setNewBlog({
      title: '',
      slug: '',
      excerpt: '',
      category: 'Guides',
      cover: '/images/events/bugatti-blackfriday.jpg',
      author: { name: 'Kofi Owusu', avatar: '/images/avatars/avatar-eric-naah.jpg' },
      body: 'How organizers in Ghana can leverage mobile money USSD for instant payouts.',
    })
    setShowBlogModal(false)
  }

  const handleUpdateBlog = async (e) => {
    e.preventDefault()
    if (!editingBlog.title || !editingBlog.excerpt) {
      toast.error('Please enter title and excerpt.')
      return
    }
    try {
      await updateBlogPostMutation.mutateAsync(editingBlog)
    } catch {
      // Non-blocking fallback
    }
    updateBlogPost(editingBlog.id, editingBlog)
    toast.success('Blog article updated! Changes reflect live.')
    setEditingBlog(null)
  }

  const handleDeleteBlog = async (id) => {
    try {
      await deleteBlogPostMutation.mutateAsync(id)
    } catch {
      // Non-blocking fallback
    }
    deleteBlogPost(id)
    toast.info('Blog article removed.')
  }

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault()
    try {
      await updateAnnouncementMutation.mutateAsync(announcementForm)
    } catch {
      // Non-blocking fallback
    }
    updateAnnouncementCms(announcementForm)
    toast.success('Announcement banner updated and live on website!')
  }

  const handleToggleSection = async (sectionKey) => {
    const nextVal = !sectionsForm[sectionKey]
    const updated = { ...sectionsForm, [sectionKey]: nextVal }
    setSectionsForm(updated)
    try {
      await updateSectionsMutation.mutateAsync(updated)
    } catch {
      // Non-blocking fallback
    }
    updateSectionsCms(updated)
    toast.info(`Homepage section "${sectionKey}" is now ${nextVal ? 'visible' : 'hidden'}.`)
  }

  const handleSaveCustomSection = async (e) => {
    e.preventDefault()
    if (!sectionForm.title.trim()) {
      toast.warning('Please enter a section title.')
      return
    }

    if (editingSection) {
      try {
        await updateCustomSectionMutation.mutateAsync({ id: editingSection.id, ...sectionForm })
      } catch {
        // Non-blocking
      }
      updateCustomSection(editingSection.id, sectionForm)
      toast.success(`Section "${sectionForm.title}" updated successfully!`)
      setEditingSection(null)
    } else {
      const payload = {
        ...sectionForm,
        id: `sec-${Date.now()}`,
      }
      try {
        await createCustomSectionMutation.mutateAsync(payload)
      } catch {
        // Non-blocking
      }
      addCustomSection(payload)
      toast.success(`Custom section "${sectionForm.title}" published to website!`)
      setShowSectionModal(false)
    }

    setSectionForm({
      title: '',
      eyebrow: '',
      description: '',
      layout: 'cards',
      tone: 'light',
      ctaText: '',
      ctaLink: '',
      image: '',
      items: [],
    })
    setNewItemTitle('')
    setNewItemDesc('')
  }

  const handleDeleteCustomSection = async (id, title) => {
    if (window.confirm(`Delete custom website section "${title || 'Untitled'}"?`)) {
      try {
        await deleteCustomSectionMutation.mutateAsync(id)
      } catch {
        // Non-blocking
      }
      deleteCustomSection(id)
      toast.info('Website section deleted.')
    }
  }

  const handleSaveStat = async (e) => {
    e.preventDefault()
    if (!statForm.label.trim()) {
      toast.warning('Please enter a stat label.')
      return
    }

    const currentStats = Array.isArray(cms?.stats) ? [...cms.stats] : []
    const valNum = Number(statForm.value) || 0
    const newEntry = {
      value: valNum,
      suffix: statForm.suffix || '+',
      label: statForm.label.trim(),
    }

    let updatedStats
    if (editingStatIndex !== null) {
      updatedStats = currentStats.map((s, idx) => (idx === editingStatIndex ? newEntry : s))
      setEditingStatIndex(null)
    } else {
      updatedStats = [...currentStats, newEntry]
    }

    try {
      await updateStatsMutation.mutateAsync(updatedStats)
    } catch {
      // Non-blocking
    }
    updateStatsCms(updatedStats)
    toast.success('Platform milestone stats updated!')
    setShowStatModal(false)
    setStatForm({ value: '', suffix: '+', label: '' })
  }

  const handleDeleteStat = async (index) => {
    const currentStats = Array.isArray(cms?.stats) ? [...cms.stats] : []
    const updatedStats = currentStats.filter((_, idx) => idx !== index)
    try {
      await updateStatsMutation.mutateAsync(updatedStats)
    } catch {
      // Non-blocking
    }
    updateStatsCms(updatedStats)
    toast.info('Stat metric removed.')
  }

  const handleClearCustomStats = async () => {
    if (window.confirm('Reset stats to automatic live platform telemetry calculation?')) {
      try {
        await updateStatsMutation.mutateAsync([])
      } catch {
        // Non-blocking
      }
      updateStatsCms([])
      toast.success('Stats reset to live telemetry!')
    }
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
                {
                  id: 'sections',
                  num: '5',
                  shortLabel: 'Sections',
                  fullLabel: 'Website Sections',
                  icon: LayoutGrid,
                  badge: cms?.customSections?.length || 0,
                },
                {
                  id: 'stats',
                  num: '6',
                  shortLabel: 'Stats',
                  fullLabel: 'Milestone Stats',
                  icon: BarChart3,
                  badge: cms?.stats?.length > 0 ? cms.stats.length : 'Live',
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
              Active: {activeTab === 'hero' ? 'Hero' : activeTab === 'spotlight' ? 'Spotlight' : activeTab === 'reviews' ? 'Reviews' : activeTab === 'blog' ? 'Blog' : activeTab === 'sections' ? 'Sections' : 'Stats'}
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

              {/* Spotlight Image Add Feature: Select from media, drag and drop */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-ink-700 dark:text-ink-300">
                    Spotlight Banner Image
                  </label>
                  {spotlightForm.customImage && (
                    <button
                      type="button"
                      onClick={() => setSpotlightForm({ ...spotlightForm, customImage: '' })}
                      className="text-[11px] font-semibold text-rose-600 hover:underline dark:text-rose-400"
                    >
                      Reset to default event cover
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={spotlightFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleReadFile(file, (dataUrl) => {
                        setSpotlightForm((prev) => ({ ...prev, customImage: dataUrl }))
                        toast.success('Custom spotlight image loaded from device!')
                      })
                    }
                  }}
                />

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const file = e.dataTransfer.files?.[0]
                    if (file) {
                      handleReadFile(file, (dataUrl) => {
                        setSpotlightForm((prev) => ({ ...prev, customImage: dataUrl }))
                        toast.success('Custom spotlight image dropped from device!')
                      })
                    }
                  }}
                  className={cn(
                    'relative overflow-hidden rounded-2xl border-2 border-dashed p-4 transition text-center',
                    spotlightForm.customImage
                      ? 'border-brand-500/50 bg-brand-50/20 dark:bg-brand-950/20'
                      : 'border-ink-200 hover:border-brand-500/70 bg-ink-50/50 dark:border-white/10 dark:bg-white/[.02] dark:hover:border-brand-400/50',
                  )}
                >
                  {spotlightForm.customImage ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-ink-200 dark:border-white/10 shadow-sm">
                        <img
                          src={spotlightForm.customImage}
                          alt="Spotlight custom"
                          className="size-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 rounded-md bg-brand-600 px-1 py-0.5 text-[9px] font-bold text-white shadow-xs">
                          Active
                        </span>
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-xs font-bold text-ink-900 dark:text-white truncate">
                          Custom Image Selected
                        </p>
                        <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5">
                          Drag & drop a new file to replace, or choose from media library.
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => spotlightFileInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-700 shadow-xs hover:bg-ink-50 dark:border-white/10 dark:bg-ink-800 dark:text-ink-200"
                          >
                            <Upload className="size-3" />
                            <span>Upload from Device</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowSpotlightMediaModal(true)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100 dark:border-brand-800/40 dark:bg-brand-950/40 dark:text-brand-300"
                          >
                            <FolderOpen className="size-3" />
                            <span>Select from Media</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-3 flex flex-col items-center justify-center">
                      <div className="grid size-10 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-2">
                        <Upload className="size-5" />
                      </div>
                      <p className="text-xs font-bold text-ink-900 dark:text-white">
                        Drag and drop spotlight image here, or upload from device
                      </p>
                      <p className="text-[11px] text-ink-400 mt-0.5">
                        Supports PNG, JPG, WebP from your device or select from catalog media
                      </p>
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => spotlightFileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-ink-800 dark:bg-white dark:text-ink-900"
                        >
                          <Upload className="size-3" />
                          <span>Choose from Device</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowSpotlightMediaModal(true)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 shadow-xs hover:bg-ink-50 dark:border-white/10 dark:bg-ink-800 dark:text-ink-300"
                        >
                          <FolderOpen className="size-3" />
                          <span>Select from Media</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" size="md" iconLeft={Save} className="w-full sm:w-auto justify-center">
                  Save & Publish Spotlight
                </Button>
              </div>
            </form>

            {/* Spotlight Preview */}
            <div className="flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-ink-400">
                  Live Spotlight Card Preview
                </h4>
                <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold text-ink-600 dark:bg-white/10 dark:text-ink-300">
                  {spotlightForm.customImage ? 'Custom Banner Active' : 'Default Event Cover'}
                </span>
              </div>
              {(() => {
                const currentEvent = events.find((e) => e.slug === spotlightForm.eventSlug) || events[0]
                const displayImage = spotlightForm.customImage || currentEvent?.cover
                return (
                  <div className="relative flex-1 overflow-hidden rounded-3xl bg-ink-950 p-5 sm:p-7 text-white shadow-2xl flex flex-col justify-between min-h-[300px]">
                    <img
                      src={displayImage}
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

        {/* Media Library Selector Modal */}
        {showSpotlightMediaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm"
              onClick={() => setShowSpotlightMediaModal(false)}
            />
            <div className="relative w-full max-w-2xl rounded-3xl bg-white p-5 sm:p-7 shadow-2xl dark:bg-ink-900 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-ink-100 dark:border-white/10">
                <div>
                  <h3 className="text-lg font-black text-ink-900 dark:text-white">
                    Select Spotlight Media
                  </h3>
                  <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                    Choose from live event covers and regional festival banners
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSpotlightMediaModal(false)}
                  className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-white/10"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-1">
                {mediaLibrary.map((item, idx) => {
                  const isSelected = spotlightForm.customImage === item.src
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSpotlightForm((prev) => ({ ...prev, customImage: item.src }))
                        toast.success(`Selected "${item.title}" for spotlight banner!`)
                        setShowSpotlightMediaModal(false)
                      }}
                      className={cn(
                        'group relative aspect-[16/10] overflow-hidden rounded-xl border-2 transition-all text-left',
                        isSelected
                          ? 'border-brand-600 ring-2 ring-brand-500/30'
                          : 'border-transparent hover:border-brand-500/50',
                      )}
                    >
                      <img
                        src={item.src}
                        alt={item.title}
                        className="size-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <span className="text-[10px] font-bold text-white line-clamp-1">{item.title}</span>
                        <span className="text-[9px] text-white/70">{item.category}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 grid size-5 place-items-center rounded-full bg-brand-600 text-white shadow-xs">
                          <Check className="size-3" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="flex justify-end pt-3 border-t border-ink-100 dark:border-white/10">
                <Button variant="ghost" onClick={() => setShowSpotlightMediaModal(false)}>
                  Close
                </Button>
              </div>
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
                  Manage quotes, ratings, and profile avatars displayed in the trusted organizers marquee section.
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
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingReview(t)}
                          className="grid size-7 place-items-center rounded-lg text-ink-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10 active:scale-90 transition"
                          title="Edit review"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(t.id)}
                          className="grid size-7 place-items-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 active:scale-90 transition"
                          title="Delete review"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                    <blockquote className="mt-3 text-xs leading-relaxed text-ink-700 dark:text-ink-200">
                      “{t.quote}”
                    </blockquote>
                  </div>

                  <div className="mt-4 flex items-center gap-3 border-t border-ink-100 pt-3 dark:border-white/10">
                    <img src={t.avatar} alt={t.name} className="size-9 rounded-full bg-ink-200 object-cover ring-2 ring-white/60 dark:ring-white/10" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-ink-900 dark:text-white">{t.name}</p>
                      <p className="truncate text-[10px] text-ink-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Review Modal with Profile Image Feature */}
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

                  {/* Profile Image Feature */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-ink-700 dark:text-ink-300">
                      Profile Image / Avatar
                    </label>

                    <input
                      type="file"
                      ref={newReviewAvatarInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleReadFile(file, (dataUrl) => {
                            setNewReview((prev) => ({ ...prev, avatar: dataUrl }))
                            toast.success('Profile image uploaded from device!')
                          })
                        }
                      }}
                    />

                    <div className="flex flex-col sm:flex-row items-center gap-3.5 rounded-2xl border border-ink-200 bg-ink-50/50 p-3.5 dark:border-white/10 dark:bg-white/[.02]">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 border-brand-500 bg-ink-200 shadow-sm">
                        <img
                          src={newReview.avatar}
                          alt="Avatar preview"
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-center sm:text-left space-y-1.5">
                        <p className="text-xs font-semibold text-ink-800 dark:text-ink-200">
                          Upload profile photo from device
                        </p>
                        <button
                          type="button"
                          onClick={() => newReviewAvatarInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-ink-800 border border-ink-200 shadow-xs hover:bg-ink-50 dark:border-white/10 dark:bg-ink-800 dark:text-white"
                        >
                          <Upload className="size-3.5" />
                          <span>Choose from Device</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Avatar Presets */}
                    <div>
                      <span className="block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5">
                        Or pick from preset avatars:
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {avatarPresets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setNewReview((prev) => ({ ...prev, avatar: preset.src }))}
                            className={cn(
                              'size-8 rounded-full overflow-hidden border-2 transition hover:scale-110',
                              newReview.avatar === preset.src
                                ? 'border-brand-600 ring-2 ring-brand-500/30'
                                : 'border-transparent opacity-75 hover:opacity-100',
                            )}
                            title={preset.label}
                          >
                            <img src={preset.src} alt={preset.label} className="size-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <label className="text-xs font-bold text-ink-700 dark:text-ink-300">Rating:</label>
                    <select
                      value={newReview.rating}
                      onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                      className="rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-xs font-bold dark:border-white/10 dark:bg-ink-800 text-ink-900 dark:text-white"
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

            {/* Edit Review Modal */}
            {editingReview && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                <div
                  className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm"
                  onClick={() => setEditingReview(null)}
                />
                <form
                  onSubmit={handleUpdateReview}
                  className="relative w-full max-w-lg rounded-3xl bg-white p-5 sm:p-7 shadow-2xl dark:bg-ink-900 space-y-4 max-h-[92vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between border-b border-ink-100 pb-3 dark:border-white/10">
                    <h3 className="text-lg font-black text-ink-900 dark:text-white">
                      Edit Testimonial
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingReview(null)}
                      className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-white/10"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <Input
                    label="Author Name"
                    required
                    value={editingReview.name}
                    onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                  />

                  <Input
                    label="Role / Organization"
                    required
                    value={editingReview.role}
                    onChange={(e) => setEditingReview({ ...editingReview, role: e.target.value })}
                  />

                  <Textarea
                    label="Testimonial Quote"
                    required
                    rows={3}
                    value={editingReview.quote}
                    onChange={(e) => setEditingReview({ ...editingReview, quote: e.target.value })}
                  />

                  {/* Profile Image Edit */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-ink-700 dark:text-ink-300">
                      Profile Image / Avatar
                    </label>

                    <input
                      type="file"
                      ref={editReviewAvatarInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleReadFile(file, (dataUrl) => {
                            setEditingReview((prev) => ({ ...prev, avatar: dataUrl }))
                            toast.success('Updated profile photo from device!')
                          })
                        }
                      }}
                    />

                    <div className="flex flex-col sm:flex-row items-center gap-3.5 rounded-2xl border border-ink-200 bg-ink-50/50 p-3.5 dark:border-white/10 dark:bg-white/[.02]">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 border-brand-500 bg-ink-200 shadow-sm">
                        <img
                          src={editingReview.avatar}
                          alt="Avatar preview"
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-center sm:text-left space-y-1.5">
                        <p className="text-xs font-semibold text-ink-800 dark:text-ink-200">
                          Change profile photo from device
                        </p>
                        <button
                          type="button"
                          onClick={() => editReviewAvatarInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-ink-800 border border-ink-200 shadow-xs hover:bg-ink-50 dark:border-white/10 dark:bg-ink-800 dark:text-white"
                        >
                          <Upload className="size-3.5" />
                          <span>Upload New Photo</span>
                        </button>
                      </div>
                    </div>

                    {/* Presets */}
                    <div>
                      <span className="block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5">
                        Or pick from preset avatars:
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {avatarPresets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditingReview((prev) => ({ ...prev, avatar: preset.src }))}
                            className={cn(
                              'size-8 rounded-full overflow-hidden border-2 transition hover:scale-110',
                              editingReview.avatar === preset.src
                                ? 'border-brand-600 ring-2 ring-brand-500/30'
                                : 'border-transparent opacity-75 hover:opacity-100',
                            )}
                            title={preset.label}
                          >
                            <img src={preset.src} alt={preset.label} className="size-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <label className="text-xs font-bold text-ink-700 dark:text-ink-300">Rating:</label>
                    <select
                      value={editingReview.rating}
                      onChange={(e) => setEditingReview({ ...editingReview, rating: Number(e.target.value) })}
                      className="rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-xs font-bold dark:border-white/10 dark:bg-ink-800 text-ink-900 dark:text-white"
                    >
                      <option value={5}>5 Stars (Exceptional)</option>
                      <option value={4}>4 Stars (Very Good)</option>
                    </select>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-3">
                    <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setEditingReview(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="md" className="w-full sm:w-auto">
                      Save Testimonial Changes
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
                  Publish, edit, and manage insightful articles for event organizers and attendees.
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
                    <div className="absolute right-2 top-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingBlog(post)}
                        className="grid size-7 place-items-center rounded-lg bg-ink-900/80 text-white backdrop-blur-sm hover:bg-brand-600 active:scale-90 transition"
                        title="Edit article"
                      >
                        <Pencil className="size-3.5" />
                      </button>
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

                  {/* Blog Cover Selection from Device & Presets */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-ink-700 dark:text-ink-300">
                      Article Cover Image (Device Upload)
                    </label>

                    <input
                      type="file"
                      ref={newBlogCoverInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleReadFile(file, (dataUrl) => {
                            setNewBlog((prev) => ({ ...prev, cover: dataUrl }))
                            toast.success('Cover image selected from device!')
                          })
                        }
                      }}
                    />

                    {/* Drag and Drop Zone */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const file = e.dataTransfer.files?.[0]
                        if (file) {
                          handleReadFile(file, (dataUrl) => {
                            setNewBlog((prev) => ({ ...prev, cover: dataUrl }))
                            toast.success('Cover image dropped from device!')
                          })
                        }
                      }}
                      className="relative overflow-hidden rounded-2xl border-2 border-dashed border-ink-200 bg-ink-50/50 p-4 transition text-center hover:border-brand-500/70 dark:border-white/10 dark:bg-white/[.02]"
                    >
                      {newBlog.cover ? (
                        <div className="flex flex-col sm:flex-row items-center gap-3.5">
                          <img
                            src={newBlog.cover}
                            alt="Cover preview"
                            className="h-20 w-32 rounded-xl object-cover border border-ink-200 dark:border-white/10 shadow-xs"
                          />
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-xs font-bold text-ink-900 dark:text-white truncate">
                              Cover Image Selected
                            </p>
                            <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5">
                              Drag and drop a new image to replace
                            </p>
                            <button
                              type="button"
                              onClick={() => newBlogCoverInputRef.current?.click()}
                              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-700 shadow-xs hover:bg-ink-50 dark:border-white/10 dark:bg-ink-800 dark:text-ink-200"
                            >
                              <Upload className="size-3" />
                              <span>Select from Device</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2 flex flex-col items-center justify-center">
                          <Upload className="size-5 text-brand-600 mb-1" />
                          <p className="text-xs font-semibold text-ink-800 dark:text-ink-200">
                            Drag & drop cover image here, or select from device
                          </p>
                          <button
                            type="button"
                            onClick={() => newBlogCoverInputRef.current?.click()}
                            className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-ink-800 dark:bg-white dark:text-ink-900"
                          >
                            <Upload className="size-3" />
                            <span>Browse Device Images</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Presets */}
                    <div>
                      <span className="block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1">
                        Or select a preset editorial banner:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {blogCoverPresets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setNewBlog((prev) => ({ ...prev, cover: preset.src }))}
                            className={cn(
                              'relative h-10 w-16 overflow-hidden rounded-lg border transition',
                              newBlog.cover === preset.src
                                ? 'border-brand-600 ring-2 ring-brand-500/40'
                                : 'border-ink-200 opacity-70 hover:opacity-100 dark:border-white/10',
                            )}
                            title={preset.label}
                          >
                            <img src={preset.src} alt="" className="size-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Textarea
                    label="Article Content (Markdown / Text)"
                    rows={4}
                    value={newBlog.body}
                    onChange={(e) => setNewBlog({ ...newBlog, body: e.target.value })}
                    placeholder="Full article content..."
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

            {/* Edit Blog Modal */}
            {editingBlog && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                <div
                  className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm"
                  onClick={() => setEditingBlog(null)}
                />
                <form
                  onSubmit={handleUpdateBlog}
                  className="relative w-full max-w-lg rounded-3xl bg-white p-5 sm:p-7 shadow-2xl dark:bg-ink-900 space-y-4 max-h-[92vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between border-b border-ink-100 pb-3 dark:border-white/10">
                    <h3 className="text-lg font-black text-ink-900 dark:text-white">
                      Edit Blog Article
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingBlog(null)}
                      className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-white/10"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <Input
                    label="Article Title"
                    required
                    value={editingBlog.title}
                    onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                  />

                  <Input
                    label="Category"
                    value={editingBlog.category}
                    onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                  />

                  <Textarea
                    label="Short Excerpt / Teaser"
                    required
                    rows={2}
                    value={editingBlog.excerpt}
                    onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                  />

                  {/* Cover Image Selection from Device */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-ink-700 dark:text-ink-300">
                      Article Cover Image (Device Upload)
                    </label>

                    <input
                      type="file"
                      ref={editBlogCoverInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleReadFile(file, (dataUrl) => {
                            setEditingBlog((prev) => ({ ...prev, cover: dataUrl }))
                            toast.success('Updated cover image from device!')
                          })
                        }
                      }}
                    />

                    {/* Drag and Drop Zone */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const file = e.dataTransfer.files?.[0]
                        if (file) {
                          handleReadFile(file, (dataUrl) => {
                            setEditingBlog((prev) => ({ ...prev, cover: dataUrl }))
                            toast.success('New cover image dropped from device!')
                          })
                        }
                      }}
                      className="relative overflow-hidden rounded-2xl border-2 border-dashed border-ink-200 bg-ink-50/50 p-4 transition text-center hover:border-brand-500/70 dark:border-white/10 dark:bg-white/[.02]"
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-3.5">
                        <img
                          src={editingBlog.cover}
                          alt="Cover preview"
                          className="h-20 w-32 rounded-xl object-cover border border-ink-200 dark:border-white/10 shadow-xs"
                        />
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-xs font-bold text-ink-900 dark:text-white truncate">
                            Current Cover Image
                          </p>
                          <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5">
                            Select a new image from device or drop here to replace
                          </p>
                          <button
                            type="button"
                            onClick={() => editBlogCoverInputRef.current?.click()}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-700 shadow-xs hover:bg-ink-50 dark:border-white/10 dark:bg-ink-800 dark:text-ink-200"
                          >
                            <Upload className="size-3" />
                            <span>Select New Image from Device</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Presets */}
                    <div>
                      <span className="block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1">
                        Or pick from editorial presets:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {blogCoverPresets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditingBlog((prev) => ({ ...prev, cover: preset.src }))}
                            className={cn(
                              'relative h-10 w-16 overflow-hidden rounded-lg border transition',
                              editingBlog.cover === preset.src
                                ? 'border-brand-600 ring-2 ring-brand-500/40'
                                : 'border-ink-200 opacity-70 hover:opacity-100 dark:border-white/10',
                            )}
                            title={preset.label}
                          >
                            <img src={preset.src} alt="" className="size-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Textarea
                    label="Article Content (Markdown / Text)"
                    rows={4}
                    value={typeof editingBlog.body === 'string' ? editingBlog.body : (Array.isArray(editingBlog.body) ? editingBlog.body.map(b => typeof b === 'string' ? b : b.text || '').join('\n\n') : '')}
                    onChange={(e) => setEditingBlog({ ...editingBlog, body: e.target.value })}
                  />

                  <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-3">
                    <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setEditingBlog(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="md" className="w-full sm:w-auto">
                      Save Article Changes
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: WEBSITE SECTIONS & ANNOUNCEMENTS */}
        {activeTab === 'sections' && (
          <div className="space-y-8">
            {/* 1. TOP ANNOUNCEMENT BANNER */}
            <form onSubmit={handleSaveAnnouncement} className="surface p-5 sm:p-7 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-ink-200/80 pb-4 dark:border-white/10">
                <div>
                  <h3 className="text-base font-black text-ink-900 dark:text-white flex items-center gap-2">
                    <Megaphone className="size-4 text-brand-600 dark:text-brand-400" />
                    Top Announcement Banner
                  </h3>
                  <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                    Display an urgent alert or promotion across the very top of the website.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementForm.enabled}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-ink-200 peer-focus:outline-hidden rounded-full peer dark:bg-ink-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ink-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-ink-600 peer-checked:bg-brand-600"></div>
                  <span className="ml-2.5 text-xs font-bold text-ink-700 dark:text-ink-200">
                    {announcementForm.enabled ? 'Banner Active' : 'Banner Disabled'}
                  </span>
                </label>
              </div>

              {announcementForm.enabled && (
                <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <Input
                      label="Badge Tag"
                      value={announcementForm.badge}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, badge: e.target.value })}
                      placeholder="e.g. UPDATE or NEW"
                    />
                    <div className="sm:col-span-3">
                      <Input
                        label="Announcement Message"
                        value={announcementForm.text}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, text: e.target.value })}
                        placeholder="e.g. Welcome to Eventspady Ghana — Early bird tickets are now available!"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Button Link URL"
                      value={announcementForm.link}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, link: e.target.value })}
                      placeholder="e.g. /events or https://..."
                    />
                    <Input
                      label="Button Label"
                      value={announcementForm.linkText}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, linkText: e.target.value })}
                      placeholder="e.g. Explore events"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" iconLeft={Save}>
                  Save Announcement Banner
                </Button>
              </div>
            </form>

            {/* 2. HOMEPAGE SECTIONS VISIBILITY TOGGLES */}
            <div className="surface p-5 sm:p-7 space-y-4">
              <div className="border-b border-ink-200/80 pb-3 dark:border-white/10">
                <h3 className="text-base font-black text-ink-900 dark:text-white flex items-center gap-2">
                  <Sliders className="size-4 text-brand-600 dark:text-brand-400" />
                  Homepage Default Sections Visibility
                </h3>
                <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                  Turn default homepage sections on or off with immediate real-time reflection.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {[
                  { key: 'stats', label: 'Platform Milestone Stats', desc: 'Summary metrics & telemetry counter' },
                  { key: 'categories', label: 'Category Grid', desc: 'Interactive category explorer' },
                  { key: 'featured', label: 'Featured Events', desc: 'Featured, trending & free tabs' },
                  { key: 'spotlight', label: 'Spotlight Banner', desc: 'Heroic countdown spotlight callout' },
                  { key: 'howItWorks', label: 'How It Works', desc: '4-step attendee guide rail' },
                  { key: 'nearby', label: 'Nearby Events', desc: 'Geolocation proximity events feed' },
                  { key: 'features', label: 'Platform Features', desc: 'Check-in, ticket types & payments showcase' },
                  { key: 'organizerCta', label: 'Organizer CTA', desc: 'Callout to onboard new hosts' },
                  { key: 'testimonials', label: 'Testimonials & Partners', desc: 'Reviews slider and brand marquee' },
                  { key: 'blog', label: 'Blog Highlights', desc: 'Editorial guides & updates preview' },
                ].map(({ key, label, desc }) => {
                  const isVisible = sectionsForm[key] !== false
                  return (
                    <div
                      key={key}
                      onClick={() => handleToggleSection(key)}
                      className={cn(
                        'flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none',
                        isVisible
                          ? 'border-brand-500/40 bg-brand-50/30 dark:border-brand-400/30 dark:bg-brand-500/5'
                          : 'border-ink-200/70 bg-ink-50/50 opacity-60 dark:border-white/10 dark:bg-white/[.02]',
                      )}
                    >
                      <div className="min-w-0 pr-3">
                        <p className="text-xs font-bold text-ink-900 dark:text-white">{label}</p>
                        <p className="text-[11px] text-ink-500 dark:text-ink-400 truncate">{desc}</p>
                      </div>
                      <span
                        className={cn(
                          'grid size-7 shrink-0 place-items-center rounded-xl text-xs font-bold transition',
                          isVisible
                            ? 'bg-brand-600 text-white'
                            : 'bg-ink-200 text-ink-500 dark:bg-ink-800 dark:text-ink-400',
                        )}
                      >
                        {isVisible ? <Check className="size-4" strokeWidth={3} /> : <X className="size-4" />}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 3. CUSTOM WEBSITE SECTIONS MANAGER */}
            <div className="surface p-5 sm:p-7 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-ink-200/80 pb-4 dark:border-white/10">
                <div>
                  <h3 className="text-base font-black text-ink-900 dark:text-white flex items-center gap-2">
                    <Layers className="size-4 text-brand-600 dark:text-brand-400" />
                    Custom Website Sections ({cms?.customSections?.length || 0})
                  </h3>
                  <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                    Add custom marketing sections, festival spotlights, or partner hubs to the homepage.
                  </p>
                </div>
                <Button
                  size="sm"
                  iconLeft={Plus}
                  onClick={() => {
                    setEditingSection(null)
                    setSectionForm({
                      title: '',
                      eyebrow: '',
                      description: '',
                      layout: 'cards',
                      tone: 'light',
                      ctaText: '',
                      ctaLink: '',
                      image: '',
                      items: [],
                    })
                    setShowSectionModal(true)
                  }}
                >
                  Add Website Section
                </Button>
              </div>

              {(!cms?.customSections || cms.customSections.length === 0) ? (
                <div className="py-12 text-center rounded-2xl border-2 border-dashed border-ink-200/80 dark:border-white/10 p-6">
                  <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 mb-3">
                    <LayoutGrid className="size-6" />
                  </div>
                  <h4 className="text-sm font-bold text-ink-900 dark:text-white">No custom sections added yet</h4>
                  <p className="mt-1 text-xs text-ink-500 dark:text-ink-400 max-w-sm mx-auto">
                    Create tailored campaign banners, cards grids, or split photo sections to showcase special offerings on the website.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    iconLeft={Plus}
                    className="mt-4"
                    onClick={() => {
                      setEditingSection(null)
                      setShowSectionModal(true)
                    }}
                  >
                    Add First Section
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {cms.customSections.map((sec) => (
                    <div
                      key={sec.id}
                      className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-ink-900 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          {sec.eyebrow && (
                            <Badge tone="accent" size="sm" className="mb-1">
                              {sec.eyebrow}
                            </Badge>
                          )}
                          <h4 className="text-base font-bold text-ink-900 dark:text-white">
                            {sec.title}
                          </h4>
                          {sec.description && (
                            <p className="mt-1 text-xs text-ink-500 dark:text-ink-400 line-clamp-2">
                              {sec.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSection(sec)
                              setSectionForm({
                                title: sec.title || '',
                                eyebrow: sec.eyebrow || '',
                                description: sec.description || '',
                                layout: sec.layout || 'cards',
                                tone: sec.tone || 'light',
                                ctaText: sec.ctaText || '',
                                ctaLink: sec.ctaLink || '',
                                image: sec.image || '',
                                items: Array.isArray(sec.items) ? sec.items : [],
                              })
                              setShowSectionModal(true)
                            }}
                            className="grid size-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-brand-600 dark:hover:bg-white/10"
                            title="Edit section"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomSection(sec.id, sec.title)}
                            className="grid size-8 place-items-center rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                            title="Delete section"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-ink-100 dark:border-white/5 text-[11px] text-ink-500 dark:text-ink-400">
                        <span className="font-semibold uppercase tracking-wider bg-ink-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                          Layout: {sec.layout || 'cards'}
                        </span>
                        <span className="font-semibold uppercase tracking-wider bg-ink-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                          Tone: {sec.tone || 'light'}
                        </span>
                        <span>{sec.items?.length || 0} items</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CUSTOM SECTION MODAL */}
            {showSectionModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                <div className="surface max-w-xl w-full p-6 sm:p-7 rounded-3xl space-y-4 max-h-[90vh] overflow-y-auto my-auto shadow-2xl">
                  <div className="flex items-center justify-between border-b border-ink-200/80 pb-3 dark:border-white/10">
                    <h3 className="text-base font-bold text-ink-900 dark:text-white">
                      {editingSection ? 'Edit Website Section' : 'Add New Website Section'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowSectionModal(false)}
                      className="text-ink-400 hover:text-ink-600 dark:hover:text-white"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveCustomSection} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Section Title"
                        value={sectionForm.title}
                        onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                        placeholder="e.g. Festival Season Specials"
                        required
                      />
                      <Input
                        label="Eyebrow Badge"
                        value={sectionForm.eyebrow}
                        onChange={(e) => setSectionForm({ ...sectionForm, eyebrow: e.target.value })}
                        placeholder="e.g. Curated Spotlight"
                      />
                    </div>

                    <Textarea
                      label="Description"
                      rows={2}
                      value={sectionForm.description}
                      onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                      placeholder="Brief headline or marketing summary..."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                          Layout Structure
                        </label>
                        <select
                          value={sectionForm.layout}
                          onChange={(e) => setSectionForm({ ...sectionForm, layout: e.target.value })}
                          className="field h-10 w-full text-xs"
                        >
                          <option value="cards">Feature Cards Grid</option>
                          <option value="banner">Full-Width Callout Banner</option>
                          <option value="split">Split Photo & Feature List</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                          Background Tone
                        </label>
                        <select
                          value={sectionForm.tone}
                          onChange={(e) => setSectionForm({ ...sectionForm, tone: e.target.value })}
                          className="field h-10 w-full text-xs"
                        >
                          <option value="light">Clean Light (Subtle)</option>
                          <option value="dark">Dark Charcoal / Ink</option>
                          <option value="brand">Brand Blue Gradient</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Button Action Label"
                        value={sectionForm.ctaText}
                        onChange={(e) => setSectionForm({ ...sectionForm, ctaText: e.target.value })}
                        placeholder="e.g. View All Events"
                      />
                      <Input
                        label="Button Link URL"
                        value={sectionForm.ctaLink}
                        onChange={(e) => setSectionForm({ ...sectionForm, ctaLink: e.target.value })}
                        placeholder="e.g. /events"
                      />
                    </div>

                    {/* Items Builder */}
                    <div className="border border-ink-200/80 dark:border-white/10 rounded-2xl p-4 space-y-3 bg-ink-50/50 dark:bg-white/[.02]">
                      <h4 className="text-xs font-bold text-ink-900 dark:text-white uppercase tracking-wider">
                        Section Cards / Bullet Points ({sectionForm.items.length})
                      </h4>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newItemTitle}
                          onChange={(e) => setNewItemTitle(e.target.value)}
                          placeholder="Card / Item Title"
                          className="field h-9 text-xs flex-1"
                        />
                        <input
                          type="text"
                          value={newItemDesc}
                          onChange={(e) => setNewItemDesc(e.target.value)}
                          placeholder="Short description"
                          className="field h-9 text-xs flex-1"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            if (!newItemTitle.trim()) return
                            setSectionForm({
                              ...sectionForm,
                              items: [
                                ...sectionForm.items,
                                { title: newItemTitle.trim(), description: newItemDesc.trim() },
                              ],
                            })
                            setNewItemTitle('')
                            setNewItemDesc('')
                          }}
                        >
                          Add
                        </Button>
                      </div>

                      {sectionForm.items.length > 0 && (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {sectionForm.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-ink-800 border border-ink-200/60 dark:border-white/5 text-xs"
                            >
                              <div className="min-w-0 pr-2">
                                <span className="font-bold text-ink-900 dark:text-white">
                                  {typeof item === 'string' ? item : item.title}
                                </span>
                                {item.description && (
                                  <span className="text-ink-500 dark:text-ink-400 ml-2">
                                    — {item.description}
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSectionForm({
                                    ...sectionForm,
                                    items: sectionForm.items.filter((_, i) => i !== idx),
                                  })
                                }}
                                className="text-rose-500 hover:text-rose-700"
                              >
                                <X className="size-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-ink-200/80 dark:border-white/10">
                      <Button variant="ghost" type="button" onClick={() => setShowSectionModal(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingSection ? 'Save Section Changes' : 'Publish Section to Website'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: MILESTONE PLATFORM STATS */}
        {activeTab === 'stats' && (
          <div className="surface p-5 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-ink-200/80 pb-4 dark:border-white/10">
              <div>
                <h3 className="text-base font-black text-ink-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="size-4 text-brand-600 dark:text-brand-400" />
                  Homepage Milestone Statistics
                </h3>
                <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                  When empty, the platform calculates live system telemetry in real time. Add custom goals to override.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {cms?.stats?.length > 0 && (
                  <Button size="sm" variant="outline" onClick={handleClearCustomStats}>
                    Reset to Live Telemetry
                  </Button>
                )}
                <Button
                  size="sm"
                  iconLeft={Plus}
                  onClick={() => {
                    setEditingStatIndex(null)
                    setStatForm({ value: '', suffix: '+', label: '' })
                    setShowStatModal(true)
                  }}
                >
                  Add Custom Stat
                </Button>
              </div>
            </div>

            {/* Current Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cms?.stats?.length > 0 ? (
                cms.stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-brand-500/30 bg-brand-50/20 dark:border-brand-400/20 dark:bg-brand-500/5 relative group"
                  >
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStatIndex(idx)
                          setStatForm({
                            value: stat.value,
                            suffix: stat.suffix || '+',
                            label: stat.label,
                          })
                          setShowStatModal(true)
                        }}
                        className="grid size-7 place-items-center rounded-md bg-white dark:bg-ink-800 text-ink-600 hover:text-brand-600 shadow-xs"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStat(idx)}
                        className="grid size-7 place-items-center rounded-md bg-white dark:bg-ink-800 text-rose-500 hover:text-rose-700 shadow-xs"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <p className="text-3xl font-extrabold text-ink-900 dark:text-white">
                      {stat.value}{stat.suffix}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-ink-500 dark:text-ink-400">{stat.label}</p>
                    <span className="mt-3 inline-block text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      Custom Goal
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-50/30 dark:border-emerald-400/20 dark:bg-emerald-500/5">
                    <p className="text-3xl font-extrabold text-ink-900 dark:text-white">Live Data</p>
                    <p className="mt-1 text-xs font-semibold text-ink-500 dark:text-ink-400">Tickets booked</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Automatic Telemetry
                    </span>
                  </div>
                  <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-50/30 dark:border-emerald-400/20 dark:bg-emerald-500/5">
                    <p className="text-3xl font-extrabold text-ink-900 dark:text-white">Live Data</p>
                    <p className="mt-1 text-xs font-semibold text-ink-500 dark:text-ink-400">Verified organizers</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Automatic Telemetry
                    </span>
                  </div>
                  <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-50/30 dark:border-emerald-400/20 dark:bg-emerald-500/5">
                    <p className="text-3xl font-extrabold text-ink-900 dark:text-white">Live Data</p>
                    <p className="mt-1 text-xs font-semibold text-ink-500 dark:text-ink-400">Live events listed</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Automatic Telemetry
                    </span>
                  </div>
                  <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-50/30 dark:border-emerald-400/20 dark:bg-emerald-500/5">
                    <p className="text-3xl font-extrabold text-ink-900 dark:text-white">99.9%</p>
                    <p className="mt-1 text-xs font-semibold text-ink-500 dark:text-ink-400">Gate scanner uptime</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      High-Availability Gateway
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Stat Modal */}
            {showStatModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <div className="surface max-w-sm w-full p-6 rounded-3xl space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-ink-200/80 pb-3 dark:border-white/10">
                    <h3 className="text-base font-bold text-ink-900 dark:text-white">
                      {editingStatIndex !== null ? 'Edit Milestone Stat' : 'Add Milestone Stat'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowStatModal(false)}
                      className="text-ink-400 hover:text-ink-600 dark:hover:text-white"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveStat} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Metric Value"
                        type="number"
                        value={statForm.value}
                        onChange={(e) => setStatForm({ ...statForm, value: e.target.value })}
                        placeholder="e.g. 50000"
                        required
                      />
                      <Input
                        label="Suffix"
                        value={statForm.suffix}
                        onChange={(e) => setStatForm({ ...statForm, suffix: e.target.value })}
                        placeholder="e.g. +, %, k GHS"
                      />
                    </div>

                    <Input
                      label="Stat Label"
                      value={statForm.label}
                      onChange={(e) => setStatForm({ ...statForm, label: e.target.value })}
                      placeholder="e.g. Satisfied Attendees"
                      required
                    />

                    <div className="flex items-center justify-end gap-2.5 pt-3">
                      <Button variant="ghost" type="button" onClick={() => setShowStatModal(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        Save Stat
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
