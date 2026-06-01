import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { AuthResponse, Role, User } from '@/types'

interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (data: AuthResponse) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)

  const login = useCallback((data: AuthResponse) => {
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    const u: AuthUser = { id: data.userId, name: data.name, email: data.email, role: data.role }
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.clear()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
