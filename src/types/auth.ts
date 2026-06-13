import type { UserAccountType } from "./enums"
import type { User } from "./user"

export interface RegisterPayload {
  fullName: string
  email: string
  phone: string
  whatsapp?: string
  accountType: UserAccountType
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  password: string
}

export interface LoginResponse {
  user: User
}

export interface UpdateProfilePayload {
  fullName: string
  phone: string
  whatsapp?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}
