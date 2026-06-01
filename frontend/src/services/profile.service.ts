import api from './api'
import type { Availability } from '@/types'

export interface PortfolioProject {
  id: string
  title: string
  description?: string
  imageUrl?: string
  githubUrl?: string
  demoUrl?: string
  technologies: string[]
  createdAt: string
}

export interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate?: string
  description?: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  credentialUrl?: string
}

export interface ProfileUpdateData {
  name?: string
  bio?: string
  title?: string
  location?: string
  availability?: Availability
  skills?: string[]
}

export const profileService = {
  async update(userId: string, data: ProfileUpdateData) {
    await api.put(`/profile/${userId}`, data)
  },

  async getPortfolio(userId: string): Promise<PortfolioProject[]> {
    const res = await api.get(`/profile/${userId}/portfolio`)
    return res.data
  },

  async addPortfolio(userId: string, data: Omit<PortfolioProject, 'id' | 'createdAt'>): Promise<PortfolioProject> {
    const res = await api.post(`/profile/${userId}/portfolio`, data)
    return res.data
  },

  async deletePortfolio(userId: string, projectId: string) {
    await api.delete(`/profile/${userId}/portfolio/${projectId}`)
  },

  async getExperiences(userId: string): Promise<Experience[]> {
    const res = await api.get(`/profile/${userId}/experience`)
    return res.data
  },

  async addExperience(userId: string, data: Omit<Experience, 'id'>): Promise<Experience> {
    const res = await api.post(`/profile/${userId}/experience`, data)
    return res.data
  },

  async deleteExperience(userId: string, expId: string) {
    await api.delete(`/profile/${userId}/experience/${expId}`)
  },

  async getCertifications(userId: string): Promise<Certification[]> {
    const res = await api.get(`/profile/${userId}/certifications`)
    return res.data
  },

  async addCertification(userId: string, data: Omit<Certification, 'id'>): Promise<Certification> {
    const res = await api.post(`/profile/${userId}/certifications`, data)
    return res.data
  },

  async deleteCertification(userId: string, certId: string) {
    await api.delete(`/profile/${userId}/certifications/${certId}`)
  },

  async favorite(freelancerId: string) {
    await api.post(`/profile/${freelancerId}/favorite`)
  },

  async unfavorite(freelancerId: string) {
    await api.delete(`/profile/${freelancerId}/favorite`)
  },

  async isFavorited(freelancerId: string): Promise<boolean> {
    const res = await api.get(`/profile/${freelancerId}/favorite`)
    return res.data.favorited
  },
}
