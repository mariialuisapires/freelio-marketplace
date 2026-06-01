import api from './api'
import type { User } from '@/types'

export const usersService = {
  async getById(id: string) {
    const res = await api.get<User>(`/users/${id}`)
    return res.data
  },

  async update(id: string, data: { name?: string; bio?: string }) {
    const res = await api.put<User>(`/users/${id}`, data)
    return res.data
  },

  async uploadPhoto(id: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post<User>(`/users/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },
}
