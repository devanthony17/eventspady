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

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
