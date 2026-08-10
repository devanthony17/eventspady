import { cn } from '@lib/utils'

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-ink-100 dark:bg-white/[.06]',
        'after:absolute after:inset-0 after:-translate-x-full after:bg-gradient-to-r',
        'after:animate-shimmer after:from-transparent after:via-white/40 after:to-transparent',
        'dark:after:via-white/10',
        className,
      )}
      aria-hidden="true"
    />
  )
}

export function EventCardSkeleton() {
  return (
    <div className="surface overflow-hidden">
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
    </div>
  )
}
