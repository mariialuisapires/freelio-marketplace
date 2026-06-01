export type Role = 'ADMIN' | 'CLIENT' | 'FREELANCER'
export type Availability = 'AVAILABLE' | 'PART_TIME' | 'UNAVAILABLE'

export type ProjectStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'
export type ContractStatus = 'ACTIVE' | 'DELIVERED' | 'FINISHED' | 'CANCELLED'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  photoUrl: string | null
  bio: string | null
  title: string | null
  location: string | null
  availability: Availability
  verified: boolean
  skills: string | null
  website: string | null
  linkedin: string | null
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  userId: string
  name: string
  email: string
  role: Role
}

export interface Project {
  id: string
  title: string
  description: string
  budget: number
  deadline: string
  status: ProjectStatus
  createdAt: string
  client: User
  categoryId?: string | null
  categoryName?: string | null
  categoryIcon?: string | null
}

export interface Proposal {
  id: string
  message: string
  price: number
  deliveryDays: number
  status: ProposalStatus
  projectId: string
  projectTitle: string
  freelancer: User
  createdAt: string
}

export interface Contract {
  id: string
  project: Project
  freelancer: User
  proposalId: string
  agreedPrice: number
  startDate: string
  endDate: string | null
  status: ContractStatus
}

export interface Review {
  id: string
  rating: number
  comment: string | null
  client: User
  freelancer: User
  contractId: string
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderPhotoUrl?: string | null
  receiverId: string
  receiverName: string
  receiverPhotoUrl?: string | null
  content: string
  sentAt: string
}

export interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export interface ErrorResponse {
  status: number
  error: string
  message: string
  path: string
  timestamp: string
  fieldErrors?: { field: string; message: string }[]
}
