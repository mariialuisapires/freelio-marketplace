import api from './api'
import type { User, Page } from '@/types'

export interface Specialty {
  id: string
  name: string
  slug: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  description: string
  freelancerCount: number
  specialties: Specialty[]
}

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const res = await api.get('/categories')
    return res.data
  },

  async getById(id: string): Promise<Category> {
    const res = await api.get(`/categories/${id}`)
    return res.data
  },

  async getSpecialties(categoryId: string): Promise<Specialty[]> {
    const res = await api.get(`/categories/${categoryId}/specialties`)
    return res.data
  },

  async getFreelancers(categoryId: string, page = 0): Promise<Page<User>> {
    const res = await api.get(`/categories/${categoryId}/freelancers?page=${page}&size=20`)
    return res.data
  },

  async setMySpecialties(freelancerId: string, primarySpecialtyId: string, specialtyIds: string[]) {
    await api.put(`/categories/freelancers/${freelancerId}/specialties`, {
      primarySpecialtyId,
      specialtyIds,
    })
  },

  async getFreelancerSpecialties(freelancerId: string): Promise<Specialty[]> {
    const res = await api.get(`/categories/freelancers/${freelancerId}/specialties`)
    return res.data
  },
}
