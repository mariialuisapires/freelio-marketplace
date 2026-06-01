import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Bell, Moon, Sun, LogOut, Menu, X, Briefcase } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Avatar } from './Avatar'
import { NotificationDropdown } from '@/features/notifications/NotificationDropdown'
import { usersService } from '@/services/users.service'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isHome = location.pathname === '/'

  const { data: myProfile } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => usersService.getById(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const links = user?.role === 'CLIENT'
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/projects', label: 'Projetos' },
        { to: '/contracts', label: 'Contratos' },
        { to: '/chat', label: 'Chat' },
      ]
    : user?.role === 'FREELANCER'
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/projects', label: 'Oportunidades' },
        { to: '/proposals', label: 'Propostas' },
        { to: '/contracts', label: 'Contratos' },
        { to: '/chat', label: 'Chat' },
      ]
    : []

  const navClass = cn(
    'sticky top-0 z-40 w-full transition-all duration-300',
    isHome
      ? scrolled
        ? 'bg-white/95 dark:bg-[#020617]/95 backdrop-blur-xl border-b border-gray-200 dark:border-white/8 shadow-sm dark:shadow-lg dark:shadow-black/20'
        : 'bg-transparent border-b border-transparent'
      : 'border-b bg-background/95 backdrop-blur'
  )

  const logoClass = cn(
    'flex items-center gap-2 font-bold text-xl transition-colors',
    isHome ? 'text-gray-900 dark:text-white' : 'text-primary'
  )

  const linkClass = cn(
    'text-sm font-medium transition-colors',
    isHome
      ? 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
      : 'text-muted-foreground hover:text-foreground'
  )

  return (
    <header className={navClass}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className={logoClass}>
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
            isHome ? 'bg-green-500/20 border border-green-500/30' : ''
          )}>
            <Briefcase className={cn('h-4 w-4', isHome ? 'text-green-400' : '')} />
          </div>
          Freelio
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <Link to="/categorias" className={linkClass}>Categorias</Link>
          {links.map(l => (
            <Link key={l.to} to={l.to} className={linkClass}>{l.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggle}
            className={cn('rounded-lg p-2 transition-colors', isHome ? 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5' : 'hover:bg-muted')}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          {user && (
            <div className="relative">
              <button
                onClick={() => setNotifOpen(o => !o)}
                className={cn('relative rounded-lg p-2 transition-colors', isHome ? 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5' : 'hover:bg-muted')}
              >
                <Bell className="h-5 w-5" />
              </button>
              {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-1.5">
              <Link to="/profile" className="hidden md:block ml-1">
                <Avatar name={user.name} photoUrl={myProfile?.photoUrl} size="sm" />
              </Link>
              <button
                onClick={handleLogout}
                className={cn('hidden md:flex items-center rounded-lg p-2 transition-colors', isHome ? 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5' : 'text-muted-foreground hover:bg-muted')}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2 ml-1">
              {isHome ? (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-400 transition-colors"
                  >
                    Cadastrar
                  </Link>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Entrar</Button>
                  <Button size="sm" onClick={() => navigate('/register')}>Cadastrar</Button>
                </>
              )}
            </div>
          )}

          <button
            className={cn('md:hidden p-2 rounded-lg', isHome ? 'text-slate-400 hover:text-white' : '')}
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={cn(
          'md:hidden border-t px-4 py-3 flex flex-col gap-3',
          isHome ? 'bg-white/95 dark:bg-[#020617]/95 backdrop-blur-xl border-gray-200 dark:border-white/8' : 'bg-background'
        )}>
          <Link to="/categorias" className={cn('text-sm font-medium py-1', isHome ? 'text-gray-700 dark:text-slate-300' : '')} onClick={() => setMobileOpen(false)}>
            Categorias
          </Link>
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={cn('text-sm font-medium py-1', isHome ? 'text-gray-700 dark:text-slate-300' : '')}
              onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/profile" className={cn('text-sm font-medium py-1', isHome ? 'text-gray-700 dark:text-slate-300' : '')} onClick={() => setMobileOpen(false)}>Perfil</Link>
              <button onClick={handleLogout} className="text-left text-sm text-red-400 py-1">Sair</button>
            </>
          ) : (
            <>
              <Link to="/login" className={cn('text-sm font-medium py-1', isHome ? 'text-gray-700 dark:text-slate-300' : '')} onClick={() => setMobileOpen(false)}>Entrar</Link>
              <Link to="/register" className="text-sm font-semibold py-1 text-green-400" onClick={() => setMobileOpen(false)}>Cadastrar</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
