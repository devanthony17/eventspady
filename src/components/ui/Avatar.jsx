import { cn } from '@lib/utils'

const SIZES = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-16 text-lg',
  '2xl': 'size-20 text-xl',
}

const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

export function Avatar({ src, name = '', size = 'md', ring = false, className }) {
  return (
    <span
      className={cn(
        'relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-brand-500 to-accent-500 font-bold text-white',
        SIZES[size] ?? SIZES.md,
        ring && 'ring-2 ring-white dark:ring-ink-900',
        className,
      )}
    >
      {src ? (
        <img src={src} alt={name ? `${name} avatar` : ''} loading="lazy" className="size-full object-cover" />
      ) : (
        initialsOf(name)
      )}
    </span>
  )
}

/** Overlapping avatar row, e.g. "who else is going". */
export function AvatarGroup({ people = [], max = 4, size = 'sm', className }) {
  const shown = people.slice(0, max)
  const overflow = people.length - shown.length

  return (
    <div className={cn('flex items-center -space-x-2', className)}>
      {shown.map((p, i) => (
        <Avatar key={p.id ?? p.name ?? i} src={p.avatar} name={p.name} size={size} ring />
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            'inline-grid place-items-center rounded-full bg-ink-200 font-bold text-ink-700 ring-2 ring-white dark:bg-white/15 dark:text-white dark:ring-ink-900',
            SIZES[size] ?? SIZES.sm,
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  )
}
