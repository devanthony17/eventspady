import { Outlet } from 'react-router-dom'
import { Bell, Heart, LayoutDashboard, Settings, Ticket, User, Wallet } from 'lucide-react'
import { useWishlist } from '@hooks/useWishlist'
import { notifications } from '@data/account'

export const dashboardNav = (savedCount, unread) => [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'My tickets', to: '/dashboard/tickets', icon: Ticket },
  { label: 'Saved events', to: '/dashboard/saved', icon: Heart, badge: savedCount },
  { label: 'Wallet', to: '/dashboard/wallet', icon: Wallet },
  { label: 'Notifications', to: '/dashboard/notifications', icon: Bell, badge: unread },
  { label: 'Profile', to: '/dashboard/profile', icon: User },
  { label: 'Settings', to: '/dashboard/settings', icon: Settings },
]

/** Provides the attendee navigation to every nested dashboard route. */
export default function DashboardLayout() {
  const { count } = useWishlist()
  const unread = notifications.filter((n) => !n.read).length

  return <Outlet context={{ nav: dashboardNav(count, unread) }} />
}
