import { cn } from '@lib/utils'

const TONES = {
  neutral: 'bg-ink-100 text-ink-700 dark:bg-white/10 dark:text-ink-200',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  accent: 'bg-accent-50 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  danger: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  info: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  solid: 'bg-ink-900 text-white dark:bg-white dark:text-ink-900',
  glass: 'bg-white/15 text-white backdrop-blur-md ring-1 ring-white/25',
}

const SIZES = {
  sm: 'px-2 py-0.5 text-[11px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-1.5',
}

export function Badge({ children, tone = 'neutral', size = 'md', icon: Icon, className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold leading-none',
        TONES[tone] ?? TONES.neutral,
        SIZES[size] ?? SIZES.md,
        className,
      )}
      {...props}
    >
      {Icon && <Icon className={cn(size === 'sm' ? 'size-3' : 'size-3.5')} aria-hidden="true" />}
      {children}
    </span>
  )
}
