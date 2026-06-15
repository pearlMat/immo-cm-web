import type { UserRole, UserAccountType, UserStatus } from "./enums"

export interface User {
  id: string
  email: string
  emailVerified: boolean
  fullName: string
  phone: string
  whatsapp: string | null
  role: UserRole
  accountType: UserAccountType | null
  status: UserStatus
  profilePhoto: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminUser extends User {
  listingsCount: number
}

export interface PaginatedUsers {
  data: AdminUser[]
  total: number
  page: number
  limit: number
  totalPages: number
}
