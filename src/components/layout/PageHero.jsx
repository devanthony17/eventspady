import { Container } from '@components/ui/Section'
import { Breadcrumbs } from '@components/ui/Breadcrumbs'
import { Badge } from '@components/ui/Badge'
import { cn } from '@lib/utils'

/** Consistent header for the static/content pages. */
export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
  tone = 'light',
  className,
  bgImage,
  imageAlt,
}) {
  const isDark = tone === 'dark' || Boolean(bgImage)

  return (
    <div
      className={cn(
        'relative overflow-hidden border-b',
        isDark
          ? 'border-white/10 bg-ink-950 text-white'
          : 'border-ink-200/70 bg-ink-50 dark:border-white/10 dark:bg-white/[.02]',
        className,
      )}
    >
      {bgImage ? (
        <>
          <img
            src={bgImage}
            alt={imageAlt || ''}
            className="absolute inset-0 size-full object-cover object-center transform scale-105 transition-transform duration-1000"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/80 to-ink-950/60 backdrop-blur-[1px]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-ink-950/95 via-ink-950/70 to-transparent"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-grid-dark [background-size:48px_48px] opacity-25 [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_70%)]"
            aria-hidden="true"
          />
        </>
      ) : isDark ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-ink-950 to-ink-950" aria-hidden="true" />
          <div
            className="absolute inset-0 bg-grid-dark [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_70%)]"
            aria-hidden="true"
          />
        </>
      ) : null}
      <div
        className={cn(
          'pointer-events-none absolute -right-24 -top-24 size-80 rounded-full blur-3xl',
          isDark ? 'bg-accent-500/20' : 'bg-brand-500/10',
        )}
        aria-hidden="true"
      />

      <Container className="relative py-12 sm:py-16 lg:py-20">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} tone={isDark ? 'inverse' : 'default'} className="mb-6" />}

        <div className="max-w-3xl">
          {eyebrow && (
            <Badge tone={isDark ? 'glass' : 'brand'} size="md" className="mb-4">
              {eyebrow}
            </Badge>
          )}
          <h1 className="text-balance text-3xl font-extrabold leading-[1.12] sm:text-4xl lg:text-[3rem]">{title}</h1>
          {description && (
            <p
              className={cn(
                'mt-4 text-pretty text-base leading-relaxed sm:text-lg',
                isDark ? 'text-white/70' : 'text-ink-500 dark:text-ink-300',
              )}
            >
              {description}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </Container>
    </div>
  )
}
