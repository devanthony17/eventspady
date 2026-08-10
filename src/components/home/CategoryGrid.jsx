import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Container, Section, SectionHeading } from '@components/ui/Section'
import { Button } from '@components/ui/Button'
import { categories } from '@data/categories'
import { cn } from '@lib/utils'

export function CategoryGrid() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Browse by interest"
          title="Explore events by category"
          description="From warehouse gigs to boardroom summits — pick a lane and see what is coming up."
          action={
            <Button to="/events" variant="outline" iconRight={ArrowRight}>
              All events
            </Button>
          }
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/events?category=${category.id}`}
              className={cn(
                'group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-ink-200/70 bg-white p-5 text-center transition duration-300',
                'hover:-translate-y-1 hover:border-transparent hover:shadow-card',
                'dark:border-white/10 dark:bg-white/[.03]',
                // Give the first two tiles more presence on wide screens.
                index === 0 && 'lg:col-span-2 lg:flex-row lg:justify-start lg:text-left',
              )}
            >
              <span
                className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                  category.color,
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  'relative grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:bg-none group-hover:bg-white/20',
                  category.color,
                )}
              >
                <category.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="relative">
                <span className="block text-sm font-bold transition-colors group-hover:text-white">
                  {category.name}
                </span>
                <span className="mt-0.5 block text-xs text-ink-400 transition-colors group-hover:text-white/75">
                  {category.count} events
                </span>
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  )
}
