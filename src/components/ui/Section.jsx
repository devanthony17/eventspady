import { cn } from '@lib/utils'
import { Badge } from '@components/ui/Badge'

export function Container({ className, children, size = 'default', ...props }) {
  const sizes = {
    default: 'max-w-7xl',
    wide: 'max-w-[88rem]',
    narrow: 'max-w-4xl',
    prose: 'max-w-3xl',
  }
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizes[size], className)} {...props}>
      {children}
    </div>
  )
}

export function Section({ className, children, size = 'default', ...props }) {
  const spacing = {
    tight: 'py-10 sm:py-14',
    default: 'py-14 sm:py-20 lg:py-24',
    loose: 'py-20 sm:py-28 lg:py-32',
  }
  return (
    <section className={cn(spacing[size], className)} {...props}>
      {children}
    </section>
  )
}

/**
 * Eyebrow + title + description block used at the top of most sections.
 * `align="between"` puts an action (e.g. "View all") on the right at lg+.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  className,
  as: Heading = 'h2',
}) {
  const centered = align === 'center'

  return (
    <div
      className={cn(
        'mb-10 gap-6 sm:mb-12',
        centered ? 'mx-auto max-w-2xl text-center' : 'flex flex-col lg:flex-row lg:items-end lg:justify-between',
        className,
      )}
    >
      <div className={cn(centered ? '' : 'max-w-2xl')}>
        {eyebrow && (
          <Badge tone="brand" size="md" className="mb-4">
            {eyebrow}
          </Badge>
        )}
        <Heading className="text-balance text-3xl font-extrabold leading-[1.15] sm:text-4xl lg:text-[2.6rem]">
          {title}
        </Heading>
        {description && (
          <p className="mt-4 text-pretty text-base leading-relaxed text-ink-500 dark:text-ink-300 sm:text-lg">
            {description}
          </p>
        )}
      </div>
      {action && <div className={cn('shrink-0', centered && 'mt-6 flex justify-center')}>{action}</div>}
    </div>
  )
}
