import api from './api'
import type { Page, Proposal } from '@/types'

export const proposalsService = {
  async getByProject(projectId: string, page = 0) {
    const res = await api.get<Page<Proposal>>(`/proposals/project/${projectId}?page=${page}&size=10`)
    return res.data
  },

  async getMine(page = 0) {
    const res = await api.get<Page<Proposal>>(`/proposals/my?page=${page}&size=20`)
    return res.data
  },

  async create(data: { projectId: string; message: string; price: number; deliveryDays: number }) {
    const res = await api.post<Proposal>('/proposals', data)
    return res.data
  },

  async accept(id: string) {
    const res = await api.put<Proposal>(`/proposals/${id}/accept`)
    return res.data
  },

  async reject(id: string) {
    const res = await api.put<Proposal>(`/proposals/${id}/reject`)
    return res.data
  },

  async delete(id: string) {
    await api.delete(`/proposals/${id}`)
  },
}
