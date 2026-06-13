import { cookies } from "next/headers"

import type { ApiResponse } from "@/types/api"
import type { User } from "@/types/user"

export const AUTH_COOKIE_NAME = "token"

/** Reads the current user from the HttpOnly JWT cookie. Returns null if unauthenticated. */
export async function getServerUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)

  if (!token) {
    return null
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { Cookie: `${AUTH_COOKIE_NAME}=${token.value}` },
      cache: "no-store",
    })

    if (!res.ok) {
      return null
    }

    const json = (await res.json()) as ApiResponse<User>
    return json.data
  } catch {
    return null
  }
}
