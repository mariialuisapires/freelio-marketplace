import api from './api'
import type { Notification, Page } from '@/types'

export const notificationsService = {
  async getAll(page = 0) {
    const res = await api.get<Page<Notification>>(`/notifications?page=${page}&size=20`)
    return res.data
  },

  async getUnreadCount() {
    const res = await api.get<{ count: number }>('/notifications/unread-count')
    return res.data.count
  },

  async markAsRead(id: string) {
    const res = await api.put<Notification>(`/notifications/${id}/read`)
    return res.data
  },
}
