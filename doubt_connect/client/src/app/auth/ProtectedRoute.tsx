import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const { state } = useAuth()
  const location = useLocation()

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-slate-600">Loading…</div>
      </div>
    )
  }

  if (state.status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: '/community' }} />
  }

  return <Outlet />
}

