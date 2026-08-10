import { cn } from '@lib/utils'

export function EmptyState({
  title = 'Nothing here yet',
  description,
  action,
  image = '/images/empty-state.svg',
  icon: Icon,
  className,
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
      {Icon ? (
        <span className="mb-6 grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <Icon className="size-8" aria-hidden="true" />
        </span>
      ) : (
        <img src={image} alt="" className="mb-6 h-40 w-auto opacity-90" loading="lazy" />
      )}
      <h3 className="text-xl font-bold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-ink-500 dark:text-ink-400">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
