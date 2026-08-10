import { useEffect, useState } from 'react'
import { Container, Section } from '@components/ui/Section'
import { PageHero } from '@components/layout/PageHero'
import { cn, formatDate } from '@lib/utils'

/**
 * Long-form legal page with a sticky table of contents that tracks
 * the section currently in view.
 * `sections`: [{ id, title, body: string[] | { type, items }[] }]
 */
export function LegalPage({ eyebrow, title, description, updatedAt, sections, breadcrumbs }) {
  const [activeId, setActiveId] = useState(sections[0]?.id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
    )

    sections.forEach((section) => {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sections])

  return (
    <>
      <PageHero
        eyebrow={eyebrow}
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
      >
        <p className="text-sm text-ink-500 dark:text-ink-400">
          Last updated {formatDate(updatedAt, { month: 'long' })}
        </p>
      </PageHero>

      <Section size="tight">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-14">
            {/* Table of contents */}
            <nav aria-label="On this page" className="hidden lg:block">
              <div className="sticky top-24">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-400">On this page</p>
                <ul className="space-y-1 border-l border-ink-200 dark:border-white/10">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className={cn(
                          '-ml-px block border-l-2 py-1.5 pl-4 text-sm transition',
                          activeId === section.id
                            ? 'border-brand-600 font-semibold text-brand-600 dark:border-brand-400 dark:text-brand-400'
                            : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-800 dark:text-ink-400 dark:hover:text-white',
                        )}
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Content */}
            <div className="min-w-0 max-w-3xl">
              {sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-24 pb-10">
                  <h2 className="text-2xl font-extrabold">{section.title}</h2>

                  <div className="mt-4 space-y-4">
                    {section.body.map((block, i) =>
                      typeof block === 'string' ? (
                        <p key={i} className="text-pretty leading-relaxed text-ink-600 dark:text-ink-300">
                          {block}
                        </p>
                      ) : (
                        <ul key={i} className="space-y-2.5">
                          {block.items.map((item) => (
                            <li key={item} className="flex gap-3 text-ink-600 dark:text-ink-300">
                              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                              <span className="text-pretty leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ),
                    )}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
