import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../app/auth/AuthContext'
import { useEffect, useState } from 'react'
import { api } from '../app/api/http'

interface NavbarProps {
  isAuthenticated?: boolean
}

export function Navbar({ isAuthenticated = false }: NavbarProps) {
  const { state, logout } = useAuth()
  const user = state.status === 'authenticated' ? state.user : null
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated || !user) return
    
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/api/messages/unread-count')
        setUnreadCount(response.data.unreadCount)
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    }
    
    fetchUnreadCount()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, user])

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to={isAuthenticated ? "/community" : "/"} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-500 text-white grid place-items-center text-base font-bold shadow-lg">
            DC
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary-900 to-primary-700 bg-clip-text text-transparent">
            DoubtConnect
          </span>
        </Link>

        {/* Navigation Links - Only for authenticated users */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/community"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`
              }
            >
              Community
            </NavLink>
            <NavLink
              to="/ask"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`
              }
            >
              Ask Question
            </NavLink>
            <NavLink
              to="/contributors"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`
              }
            >
              Contributors
            </NavLink>
            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`
              }
            >
              Leaderboard
            </NavLink>
            <NavLink
              to="/messages"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              Messages
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`
              }
            >
              About
            </NavLink>
          </nav>
        )}

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              {/* Mobile menu button for authenticated users */}
              <div className="md:hidden">
                <button className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* User Profile - links to current user's profile page */}
              <div className="flex items-center gap-3">
                <Link
                  to={user.id ? `/profile/${user.id}` : '/profile'}
                  className="flex items-center gap-3 rounded-xl bg-white border border-neutral-200 px-3 py-2 hover:bg-neutral-50 transition-all"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white grid place-items-center text-sm font-bold">
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-neutral-900">{user.name.split(' ')[0]}</div>
                    <div className="text-xs text-neutral-500">Rep {user.reputationScore}</div>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-all"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Landing page actions */}
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 border border-neutral-200 transition-all"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-gradient-to-r from-primary-600 to-secondary-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:from-primary-700 hover:to-secondary-600 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu for authenticated users */}
      {isAuthenticated && (
        <div className="md:hidden border-t border-neutral-100 bg-white">
          <nav className="flex flex-col py-2">
            <NavLink
              to="/community"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`
              }
            >
              Community
            </NavLink>
            <NavLink
              to="/ask"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`
              }
            >
              Ask Question
            </NavLink>
            <NavLink
              to="/contributors"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`
              }
            >
              Contributors
            </NavLink>
            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`
              }
            >
              Leaderboard
            </NavLink>
            <NavLink
              to="/messages"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium relative ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`
              }
            >
              Messages
              {unreadCount > 0 && (
                <span className="absolute top-2 right-3 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`
              }
            >
              About
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  )
}