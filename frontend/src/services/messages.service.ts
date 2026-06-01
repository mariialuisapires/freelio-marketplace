import api from './api'
import type { Message, Page } from '@/types'

export const messagesService = {
  async getConversation(userId: string, page = 0) {
    const res = await api.get<Page<Message>>(`/messages/conversation/${userId}?page=${page}&size=50`)
    return res.data
  },

  async getInbox(page = 0) {
    const res = await api.get<Page<Message>>(`/messages?page=${page}&size=20`)
    return res.data
  },

  async send(data: { receiverId: string; content: string }) {
    const res = await api.post<Message>('/messages', data)
    return res.data
  },
}
