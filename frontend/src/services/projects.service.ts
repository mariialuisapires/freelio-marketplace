import api from './api'
import type { Page, Project, ProjectStatus } from '@/types'

export interface ProjectFilters {
  status?: ProjectStatus
  minBudget?: number
  maxBudget?: number
  keyword?: string
  page?: number
  size?: number
  categoryId?: string
}

export const projectsService = {
  async getAll(filters: ProjectFilters = {}) {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.minBudget) params.set('minBudget', String(filters.minBudget))
    if (filters.maxBudget) params.set('maxBudget', String(filters.maxBudget))
    if (filters.keyword) params.set('keyword', filters.keyword)
    params.set('page', String(filters.page ?? 0))
    params.set('size', String(filters.size ?? 12))
    const res = await api.get<Page<Project>>(`/projects?${params}`)
    return res.data
  },

  async getByCategories(categoryIds: string[], page = 0): Promise<Page<Project>> {
    const params = new URLSearchParams()
    categoryIds.forEach(id => params.append('categoryIds', id))
    params.set('page', String(page))
    params.set('size', '20')
    const res = await api.get<Page<Project>>(`/projects/by-categories?${params}`)
    return res.data
  },

  async getById(id: string) {
    const res = await api.get<Project>(`/projects/${id}`)
    return res.data
  },

  async create(data: { title: string; description: string; budget: number; deadline: string; categoryId?: string }) {
    const res = await api.post<Project>('/projects', data)
    return res.data
  },

  async update(id: string, data: { title: string; description: string; budget: number; deadline: string; categoryId?: string }) {
    const res = await api.put<Project>(`/projects/${id}`, data)
    return res.data
  },

  async delete(id: string) {
    await api.delete(`/projects/${id}`)
  },
}
