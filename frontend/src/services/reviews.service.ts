import api from './api'
import type { Page, Review } from '@/types'

export const reviewsService = {
  async getByFreelancer(freelancerId: string, page = 0) {
    const res = await api.get<Page<Review>>(`/reviews/freelancer/${freelancerId}?page=${page}&size=10`)
    return res.data
  },

  async getAverage(freelancerId: string) {
    const res = await api.get<number>(`/reviews/freelancer/${freelancerId}/average`)
    return res.data
  },

  async create(data: { contractId: string; rating: number; comment?: string }) {
    const res = await api.post<Review>('/reviews', data)
    return res.data
  },
}
