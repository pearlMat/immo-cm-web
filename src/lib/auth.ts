import { api } from "@/lib/api"
import type {
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResetPasswordPayload,
} from "@/types/auth"

export function register(payload: RegisterPayload) {
  return api.post<void>("/auth/register", payload)
}

export function login(payload: LoginPayload) {
  return api.post<LoginResponse>("/auth/login", payload)
}

export function logout() {
  return api.post<void>("/auth/logout")
}

export function verifyEmail(token: string) {
  return api.get<void>(`/auth/verify-email/${token}`)
}

export function resendVerification(email: string) {
  return api.post<void>("/auth/resend-verification", { email })
}

export function forgotPassword(payload: ForgotPasswordPayload) {
  return api.post<void>("/auth/forgot-password", payload)
}

export function resetPassword(payload: ResetPasswordPayload) {
  return api.post<void>("/auth/reset-password", payload)
}
