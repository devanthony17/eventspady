import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Bell, CalendarClock, CheckCheck, CreditCard, Megaphone, Ticket } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { DashboardShell } from '@components/dashboard/DashboardShell'
import { Button } from '@components/ui/Button'
import { Tabs } from '@components/ui/Tabs'
import { EmptyState } from '@components/ui/EmptyState'
import { useToast } from '@context/ToastContext'
import { notifications as seed } from '@data/account'
import { cn, formatDate } from '@lib/utils'

const TYPE_META = {
  ticket: { icon: Ticket, tone: 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300' },
  reminder: { icon: CalendarClock, tone: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  payment: { icon: CreditCard, tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  event: { icon: Megaphone, tone: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300' },
}

export default function Notifications() {
  const { nav } = useOutletContext()
  const [items, setItems] = useState(seed)
  const [tab, setTab] = useState('all')
  const toast = useToast()

  const unread = items.filter((n) => !n.read)
  const list = tab === 'unread' ? unread : items

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success('All notifications marked as read.')
  }

  return (
    <>
      <Seo title="Notifications" noIndex />

      <DashboardShell
        nav={nav}
        title="Notifications"
        description="Ticket confirmations, event reminders and payment updates."
        actions={
          unread.length > 0 && (
            <Button size="sm" variant="outline" iconLeft={CheckCheck} onClick={markAllRead}>
              Mark all read
            </Button>
          )
        }
      >
        <Tabs
          tabs={[
            { id: 'all', label: 'All', count: items.length },
            { id: 'unread', label: 'Unread', count: unread.length },
          ]}
          active={tab}
          onChange={setTab}
          variant="pill"
          className="mb-6 w-full sm:w-auto"
        />

        {list.length === 0 ? (
          <div className="surface">
            <EmptyState
              icon={Bell}
              title={tab === 'unread' ? 'You are all caught up' : 'No notifications yet'}
              description="Booking confirmations and event reminders will land here."
            />
          </div>
        ) : (
          <ul className="surface divide-y divide-ink-200/70 overflow-hidden dark:divide-white/10">
            {list.map((notification) => {
              const meta = TYPE_META[notification.type] ?? TYPE_META.event
              const Icon = meta.icon

              return (
                <li
                  key={notification.id}
                  className={cn(
                    'flex gap-4 p-5 transition',
                    !notification.read && 'bg-brand-50/50 dark:bg-brand-500/[.06]',
                  )}
                >
                  <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', meta.tone)}>
                    <Icon className="size-5" aria-hidden="true" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <p className="flex-1 text-sm font-bold">{notification.title}</p>
                      {!notification.read && (
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500" aria-label="Unread" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{notification.body}</p>
                    <p className="mt-1.5 text-xs text-ink-400">{formatDate(notification.at, { month: 'long' })}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </DashboardShell>
    </>
  )
}
