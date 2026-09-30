import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'

/**
 * Gate for dashboard routes. Sends unauthenticated visitors to sign in
 * and returns them to where they were headed afterwards.
 */
export function RequireAuth({ role }) {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="size-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" role="status">
          <span className="sr-only">Loading</span>
        </div>
      </div>
    )
  }

  const isAdminRoute = role === 'admin' || location.pathname.startsWith('/admin')

  if (!isAuthenticated || !user) {
    const loginTarget = isAdminRoute ? '/admin/login' : '/login'
    return <Navigate to={loginTarget} state={{ from: location.pathname }} replace />
  }

  if (role && user.role !== role && user.role !== 'admin') {
    if (isAdminRoute) {
      return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
    }
    return <Navigate to={user.role === 'organizer' ? '/organizer' : '/dashboard'} replace />
  }

  return <Outlet />
}
