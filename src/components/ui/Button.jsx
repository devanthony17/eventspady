import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '@lib/utils'

const VARIANTS = {
  primary:
    'bg-brand-600 text-white shadow-lift hover:bg-brand-700 active:bg-brand-800 disabled:hover:bg-brand-600',
  secondary:
    'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950 dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100',
  outline:
    'border border-ink-200 bg-white text-ink-800 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-white/15 dark:bg-transparent dark:text-ink-100 dark:hover:border-brand-500/40 dark:hover:bg-white/5 dark:hover:text-white',
  ghost:
    'text-ink-700 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-200 dark:hover:bg-white/10 dark:hover:text-white',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-200 dark:hover:bg-brand-500/25',
  accent: 'bg-accent-500 text-white shadow-soft hover:bg-accent-600 active:bg-accent-700',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800',
  link: 'text-brand-600 underline-offset-4 hover:underline dark:text-brand-400 px-0',
}

const SIZES = {
  xs: 'h-8 gap-1.5 px-3 text-xs',
  sm: 'h-9 gap-1.5 px-3.5 text-sm',
  md: 'h-11 gap-2 px-5 text-sm',
  lg: 'h-12 gap-2 px-6 text-[15px]',
  xl: 'h-14 gap-2.5 px-8 text-base',
  icon: 'size-10 shrink-0',
}

/**
 * Renders a `<button>`, a router `<Link>` (`to`) or an `<a>` (`href`),
 * keeping one visual language across all three.
 */
export const Button = forwardRef(function Button(
  {
    as,
    to,
    href,
    variant = 'primary',
    size = 'md',
    className,
    children,
    loading = false,
    disabled = false,
    fullWidth = false,
    iconLeft: IconLeft,
    iconRight: IconRight,
    ...props
  },
  ref,
) {
  const classes = cn(
    'inline-flex select-none items-center justify-center whitespace-nowrap rounded-xl font-semibold',
    'transition-all duration-200 active:scale-[.98]',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    fullWidth && 'w-full',
    className,
  )

  const content = (
    <>
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        IconLeft && <IconLeft className={cn(size === 'xs' ? 'size-3.5' : 'size-4')} aria-hidden="true" />
      )}
      {children}
      {IconRight && !loading && (
        <IconRight className={cn(size === 'xs' ? 'size-3.5' : 'size-4')} aria-hidden="true" />
      )}
    </>
  )

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} aria-disabled={disabled || undefined} {...props}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {content}
      </a>
    )
  }

  const Component = as ?? 'button'
  return (
    <Component
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </Component>
  )
})
