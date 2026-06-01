import api from './api'
import type { AuthResponse, Role } from '@/types'

export const authService = {
  async register(data: { name: string; email: string; password: string; role: Role }) {
    const res = await api.post<AuthResponse>('/auth/register', data)
    return res.data
  },

  async login(data: { email: string; password: string }) {
    const res = await api.post<AuthResponse>('/auth/login', data)
    return res.data
  },

  logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  },
}
