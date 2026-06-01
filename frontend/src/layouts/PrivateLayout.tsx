import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Navbar } from '@/components/common/Navbar'
import { useAuth } from '@/contexts/AuthContext'

const FULL_WIDTH_ROUTES = ['/dashboard', '/chat']

export function PrivateLayout() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const isFullWidth = FULL_WIDTH_ROUTES.some(r => location.pathname.startsWith(r))

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {isFullWidth ? (
        <Outlet />
      ) : (
        <main className="mx-auto max-w-7xl px-4 py-8">
          <Outlet />
        </main>
      )}
    </div>
  )
}
