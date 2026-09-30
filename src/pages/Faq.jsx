import { useMemo, useState } from 'react'
import { LifeBuoy, MessageSquare, Search } from 'lucide-react'
import { Seo, faqJsonLd } from '@components/ui/Seo'
import { PageHero } from '@components/layout/PageHero'
import { Container, Section } from '@components/ui/Section'
import { Accordion } from '@components/ui/Accordion'
import { Button } from '@components/ui/Button'
import { EmptyState } from '@components/ui/EmptyState'
import { allFaqs as defaultAllFaqs, faqGroups as defaultFaqGroups } from '@data/faq'
import { useFaq } from '@hooks/api'
import { cn } from '@lib/utils'

export default function Faq() {
  const { data: faqData } = useFaq()

  const faqGroups = useMemo(() => {
    if (Array.isArray(faqData) && faqData.length > 0) return faqData
    if (Array.isArray(faqData?.groups) && faqData.groups.length > 0) return faqData.groups
    if (Array.isArray(faqData?.data) && faqData.data.length > 0) return faqData.data
    return defaultFaqGroups
  }, [faqData])

  const allFaqs = useMemo(() => {
    const fromGroups = faqGroups.flatMap((g) => g.items || [])
    return fromGroups.length > 0 ? fromGroups : defaultAllFaqs
  }, [faqGroups])

  const [query, setQuery] = useState('')
  const [activeGroup, setActiveGroup] = useState(faqGroups[0]?.id || 'attendees')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return allFaqs.filter((item) => `${item.q} ${item.a}`.toLowerCase().includes(q))
  }, [query, allFaqs])

  const group = faqGroups.find((g) => g.id === activeGroup) || faqGroups[0]

  return (
    <>
      <Seo
        title="Frequently asked questions"
        description="Answers about booking tickets, payments and refunds, QR check-in, organizing events and managing your Eventspady account."
        keywords="eventspady help, ticket booking faq, qr check-in, refunds, organizer help"
        jsonLd={faqJsonLd(allFaqs)}
      />

      <PageHero
        eyebrow="Help centre"
        title="Frequently asked questions"
        description="Everything about booking, paying, checking in and organizing. Cannot find it? Our team answers within a day."
        breadcrumbs={[{ label: 'FAQ' }]}
      >
        <div className="relative max-w-lg">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <label htmlFor="faq-search" className="sr-only">
            Search the FAQ
          </label>
          <input
            id="faq-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for an answer…"
            className="field h-12 pl-12"
          />
        </div>
      </PageHero>

      <Section>
        <Container>
          {results ? (
            <div className="mx-auto max-w-3xl">
              <p className="mb-6 text-sm text-ink-500 dark:text-ink-400">
                {results.length} {results.length === 1 ? 'answer' : 'answers'} for “{query}”
              </p>

              {results.length === 0 ? (
                <EmptyState
                  icon={LifeBuoy}
                  title="No answers matched"
                  description="Try a different word, or ask us directly — we reply within a business day."
                  action={
                    <Button to="/contact" variant="outline">
                      Contact support
                    </Button>
                  }
                />
              ) : (
                <Accordion items={results} allowMultiple defaultOpen={[0]} />
              )}
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
              {/* Group nav */}
              <nav aria-label="FAQ categories">
                <div className="sticky top-24 space-y-1">
                  {faqGroups.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveGroup(item.id)}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition',
                        activeGroup === item.id
                          ? 'bg-brand-600 text-white shadow-lift'
                          : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/[.06]',
                      )}
                    >
                      {item.title}
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-[10px] font-extrabold',
                          activeGroup === item.id ? 'bg-white/20' : 'bg-ink-100 text-ink-500 dark:bg-white/10',
                        )}
                      >
                        {item.items.length}
                      </span>
                    </button>
                  ))}
                </div>
              </nav>

              <div className="min-w-0">
                <h2 className="text-2xl font-extrabold">{group.title}</h2>
                <Accordion items={group.items} defaultOpen={[0]} className="mt-2" />

                {/* Support CTA */}
                <div className="mt-12 flex flex-col items-start gap-5 rounded-3xl bg-gradient-to-br from-brand-600 to-ink-950 p-7 text-white sm:flex-row sm:items-center sm:justify-between sm:p-9">
                  <div>
                    <h3 className="text-xl font-extrabold">Still stuck?</h3>
                    <p className="mt-2 max-w-md text-sm text-white/75">
                      Send us the details and we will get back to you within one business day — usually much sooner.
                    </p>
                  </div>
                  <Button to="/contact" variant="accent" size="lg" iconLeft={MessageSquare} className="shrink-0">
                    Contact support
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
