import { Outlet } from 'react-router-dom'
import {
  BadgePercent,
  CalendarDays,
  LayoutDashboard,
  Plus,
  Receipt,
  ScanLine,
  Users,
} from 'lucide-react'

export const organizerNav = [
  { label: 'Overview', to: '/organizer', icon: LayoutDashboard, end: true },
  { label: 'My events', to: '/organizer/events', icon: CalendarDays },
  { label: 'Create event', to: '/organizer/events/new', icon: Plus },
  { label: 'Orders', to: '/organizer/orders', icon: Receipt },
  { label: 'Coupons', to: '/organizer/coupons', icon: BadgePercent },
  { label: 'Guest list', to: '/organizer/guests', icon: Users },
  { label: 'Scanner', to: '/organizer/scanner', icon: ScanLine },
]

export default function OrganizerLayout() {
  return <Outlet context={{ nav: organizerNav }} />
}
