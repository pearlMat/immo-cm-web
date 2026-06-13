import { useQuery } from "@tanstack/react-query"

import { api, ApiError } from "@/lib/api"
import type { User } from "@/types/user"

/** Fetches the current user from /auth/me. Returns null if unauthenticated. */
export function useAuth() {
  return useQuery<User | null>({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return await api.get<User>("/auth/me")
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null
        }
        throw error
      }
    },
    retry: false,
  })
}
