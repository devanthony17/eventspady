import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, X } from 'lucide-react'
import { Container } from '@components/ui/Section'
import { Badge } from '@components/ui/Badge'
import { cn } from '@lib/utils'

export function AnnouncementBanner({ announcement }) {
  const [dismissed, setDismissed] = useState(false)

  if (!announcement || !announcement.enabled || !announcement.text || dismissed) {
    return null
  }

  const isInternal = announcement.link && announcement.link.startsWith('/')

  return (
    <aside
      aria-label="Site announcement"
      className="relative z-30 border-b border-brand-500/30 bg-gradient-to-r from-brand-900 via-brand-800 to-ink-950 px-4 py-2.5 text-white shadow-sm transition-all duration-300"
    >
      <Container size="default" className="flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex flex-1 flex-wrap items-center justify-center gap-2 text-center sm:justify-start sm:text-left">
          {announcement.badge && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/30 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-brand-200 ring-1 ring-white/20">
              <Sparkles className="size-3" />
              {announcement.badge}
            </span>
          )}
          <span className="font-medium text-white/95">{announcement.text}</span>
          {announcement.link && (
            isInternal ? (
              <Link
                to={announcement.link}
                className="inline-flex items-center gap-1 font-bold text-brand-300 underline underline-offset-2 transition hover:text-white"
              >
                {announcement.linkText || 'Learn more'}
                <ArrowRight className="size-3.5" />
              </Link>
            ) : (
              <a
                href={announcement.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-brand-300 underline underline-offset-2 transition hover:text-white"
              >
                {announcement.linkText || 'Learn more'}
                <ArrowRight className="size-3.5" />
              </a>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="grid size-6 shrink-0 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label="Dismiss announcement"
        >
          <X className="size-4" />
        </button>
      </Container>
    </aside>
  )
}

export default AnnouncementBanner
