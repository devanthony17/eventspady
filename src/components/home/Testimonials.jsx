import { Quote } from 'lucide-react'
import { Container, Section, SectionHeading } from '@components/ui/Section'
import { Avatar } from '@components/ui/Avatar'
import { Rating } from '@components/ui/Rating'
import { testimonials, trustedBy } from '@data/testimonials'

export function Testimonials() {
  return (
    <Section className="bg-ink-50 dark:bg-white/[.02]">
      <Container>
        <SectionHeading
          eyebrow="Loved by organizers"
          title="Trusted for events of every size"
          description="From 40-seat dinners to 20,000-capacity festivals — here is what teams running them say."
          align="center"
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <figure
              key={item.id}
              className="surface flex flex-col p-6 transition duration-300 hover:-translate-y-1 hover:shadow-card"
            >
              <Quote className="mb-4 size-7 shrink-0 text-brand-300 dark:text-brand-500/60" aria-hidden="true" />
              <blockquote className="flex-1 text-pretty text-sm leading-relaxed text-ink-700 dark:text-ink-200">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-ink-200/70 pt-5 dark:border-white/10">
                <Avatar src={item.avatar} name={item.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{item.name}</p>
                  <p className="truncate text-xs text-ink-500 dark:text-ink-400">{item.role}</p>
                </div>
                <Rating value={item.rating} size="sm" showValue={false} />
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Marquee of organizer names */}
        <div className="relative mt-14 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="flex w-max animate-marquee items-center gap-12">
            {[...trustedBy, ...trustedBy].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="whitespace-nowrap text-lg font-extrabold tracking-tight text-ink-300 dark:text-white/20"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
