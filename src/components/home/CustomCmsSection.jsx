import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { Container, Section, SectionHeading } from '@components/ui/Section'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { cn } from '@lib/utils'

export function CustomCmsSection({ section }) {
  if (!section || section.enabled === false) return null

  const {
    title,
    eyebrow,
    description,
    layout = 'cards',
    tone = 'light',
    ctaText,
    ctaLink,
    image,
    items = [],
  } = section

  if (!title && items.length === 0) return null

  const isDark = tone === 'dark'
  const isBrand = tone === 'brand'

  // 1. BANNER LAYOUT
  if (layout === 'banner') {
    return (
      <Section
        className={cn(
          'relative overflow-hidden',
          isDark && 'bg-ink-950 text-white',
          isBrand && 'bg-gradient-to-br from-brand-900 via-brand-800 to-ink-950 text-white',
          !isDark && !isBrand && 'bg-ink-50 dark:bg-white/[.02]',
        )}
      >
        {image && (
          <div className="absolute inset-0 overflow-hidden opacity-25">
            <img src={image} alt="" className="size-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
        )}

        <Container size="default" className="relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            {eyebrow && (
              <Badge tone={isDark || isBrand ? 'glass' : 'brand'} size="md" className="mb-4">
                {eyebrow}
              </Badge>
            )}
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              {title}
            </h2>
            {description && (
              <p
                className={cn(
                  'mt-4 text-base leading-relaxed sm:text-lg',
                  isDark || isBrand ? 'text-white/80' : 'text-ink-600 dark:text-ink-300',
                )}
              >
                {description}
              </p>
            )}
            {ctaText && ctaLink && (
              <div className="mt-8 flex justify-center">
                <Button
                  to={ctaLink}
                  size="lg"
                  variant={isDark || isBrand ? 'primary' : 'primary'}
                  iconRight={ArrowRight}
                >
                  {ctaText}
                </Button>
              </div>
            )}
          </div>
        </Container>
      </Section>
    )
  }

  // 2. SPLIT LAYOUT (Photo + Content)
  if (layout === 'split') {
    return (
      <Section
        className={cn(
          isDark && 'bg-ink-950 text-white',
          isBrand && 'bg-gradient-to-br from-brand-900 to-ink-950 text-white',
          !isDark && !isBrand && 'bg-white dark:bg-ink-950',
        )}
      >
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              {eyebrow && (
                <Badge tone={isDark || isBrand ? 'glass' : 'accent'} size="md" className="mb-4">
                  {eyebrow}
                </Badge>
              )}
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                {title}
              </h2>
              {description && (
                <p
                  className={cn(
                    'mt-4 text-base leading-relaxed',
                    isDark || isBrand ? 'text-white/80' : 'text-ink-600 dark:text-ink-300',
                  )}
                >
                  {description}
                </p>
              )}

              {items.length > 0 && (
                <ul className="mt-6 space-y-3">
                  {items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-500/20 text-brand-500 dark:text-brand-300">
                        <CheckCircle2 className="size-4" />
                      </span>
                      <span
                        className={cn(
                          'text-sm leading-snug',
                          isDark || isBrand ? 'text-white/90' : 'text-ink-700 dark:text-ink-200',
                        )}
                      >
                        {typeof item === 'string' ? item : item.title || item.name}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {ctaText && ctaLink && (
                <div className="mt-8 flex">
                  <Button to={ctaLink} size="lg" iconRight={ArrowRight}>
                    {ctaText}
                  </Button>
                </div>
              )}
            </div>

            {image && (
              <div className="relative overflow-hidden rounded-3xl border border-ink-200/80 shadow-2xl dark:border-white/10">
                <img src={image} alt="" className="size-full object-cover" loading="lazy" />
              </div>
            )}
          </div>
        </Container>
      </Section>
    )
  }

  // 3. CARDS GRID LAYOUT (Default)
  return (
    <Section
      className={cn(
        isDark && 'bg-ink-950 text-white',
        isBrand && 'bg-brand-950 text-white',
        !isDark && !isBrand && 'bg-ink-50/60 dark:bg-white/[.02]',
      )}
    >
      <Container>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="center"
          action={
            ctaText && ctaLink ? (
              <Button to={ctaLink} variant="outline" iconRight={ArrowRight}>
                {ctaText}
              </Button>
            ) : null
          }
        />

        {items.length > 0 && (
          <div
            className={cn(
              'mt-10 grid gap-6',
              items.length === 2 && 'sm:grid-cols-2 max-w-4xl mx-auto',
              items.length === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
              items.length >= 4 && 'sm:grid-cols-2 lg:grid-cols-4',
            )}
          >
            {items.map((item, idx) => (
              <article
                key={idx}
                className={cn(
                  'rounded-3xl p-6 transition duration-300 hover:-translate-y-1',
                  isDark || isBrand
                    ? 'border border-white/10 bg-white/5 backdrop-blur-md hover:border-white/20'
                    : 'border border-ink-200/80 bg-white shadow-soft dark:border-white/10 dark:bg-ink-900',
                )}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    className="mb-4 h-36 w-full rounded-2xl object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
                    <Sparkles className="size-6" />
                  </div>
                )}
                <h3 className="text-lg font-bold">{item.title || item.name}</h3>
                {item.description && (
                  <p
                    className={cn(
                      'mt-2 text-sm leading-relaxed',
                      isDark || isBrand ? 'text-white/70' : 'text-ink-500 dark:text-ink-400',
                    )}
                  >
                    {item.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </Container>
    </Section>
  )
}

export default CustomCmsSection
