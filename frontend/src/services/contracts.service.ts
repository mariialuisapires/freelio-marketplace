import api from './api'
import type { Contract, ContractStatus, Page } from '@/types'

export const contractsService = {
  async getAll(page = 0) {
    const res = await api.get<Page<Contract>>(`/contracts?page=${page}&size=10`)
    return res.data
  },

  async getById(id: string) {
    const res = await api.get<Contract>(`/contracts/${id}`)
    return res.data
  },

  async updateStatus(id: string, status: ContractStatus) {
    const res = await api.put<Contract>(`/contracts/${id}/status`, { status })
    return res.data
  },

  async getCompletedByFreelancer(freelancerId: string, page = 0): Promise<Page<Contract>> {
    const res = await api.get(`/contracts/freelancer/${freelancerId}/completed?page=${page}&size=12`)
    return res.data
  },
}
