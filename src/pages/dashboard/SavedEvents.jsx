import { useOutletContext } from 'react-router-dom'
import { Heart, Trash2 } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { DashboardShell } from '@components/dashboard/DashboardShell'
import { Button } from '@components/ui/Button'
import { EmptyState } from '@components/ui/EmptyState'
import { EventCard } from '@components/events/EventCard'
import { useWishlist } from '@hooks/useWishlist'
import { useToast } from '@context/ToastContext'
import { events } from '@data/events'

export default function SavedEvents() {
  const { nav } = useOutletContext()
  const { ids, clear } = useWishlist()
  const toast = useToast()

  const saved = events.filter((event) => ids.includes(event.id))

  return (
    <>
      <Seo title="Saved events" noIndex />

      <DashboardShell
        nav={nav}
        title="Saved events"
        description="Events you have bookmarked. We will let you know before tickets run out."
        actions={
          saved.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              iconLeft={Trash2}
              onClick={() => {
                clear()
                toast.success('Cleared your saved events.')
              }}
            >
              Clear all
            </Button>
          )
        }
      >
        {saved.length === 0 ? (
          <div className="surface">
            <EmptyState
              icon={Heart}
              title="Nothing saved yet"
              description="Tap the heart on any event to keep it here for later."
              action={
                <Button to="/events" variant="outline">
                  Browse events
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {saved.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </DashboardShell>
    </>
  )
}
