import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function Shell() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-secondary-50">
      <Navbar isAuthenticated={true} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <main className="min-h-[calc(100vh-120px)] rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

