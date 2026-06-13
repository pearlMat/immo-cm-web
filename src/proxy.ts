import createMiddleware from "next-intl/middleware"
import { NextResponse, type NextRequest } from "next/server"

import { AUTH_COOKIE_NAME } from "@/lib/auth-server"
import { routing } from "@/i18n/routing"
import { UserRole } from "@/types/enums"

const AGENT_PREFIX = "/agent"
const ADMIN_PREFIX = "/admin"
const AUTH_PAGES = ["/connexion", "/inscription"]

const handleI18nRouting = createMiddleware(routing)

export function decodeRole(token: string): UserRole | null {
  try {
    const payload = token.split(".")[1]
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    const { role } = JSON.parse(json) as { role?: UserRole }
    return role ?? null
  } catch {
    return null
  }
}

export function dashboardFor(role: UserRole | null): string {
  return role === UserRole.ADMIN ? `${ADMIN_PREFIX}/tableau-de-bord` : `${AGENT_PREFIX}/tableau-de-bord`
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const segments = pathname.split("/")
  const maybeLocale = segments[1]

  if (!(routing.locales as readonly string[]).includes(maybeLocale)) {
    return handleI18nRouting(request)
  }

  const locale = maybeLocale
  const pathnameWithoutLocale = "/" + segments.slice(2).join("/")

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  const role = token ? decodeRole(token) : null

  const isAgentRoute = pathnameWithoutLocale.startsWith(AGENT_PREFIX)
  const isAdminRoute = pathnameWithoutLocale.startsWith(ADMIN_PREFIX)
  const isAuthPage = AUTH_PAGES.some((page) => pathnameWithoutLocale.startsWith(page))

  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(`/${locale}${path}`, request.url))

  if ((isAgentRoute || isAdminRoute) && !role) {
    return redirectTo("/connexion")
  }

  if (isAdminRoute && role !== UserRole.ADMIN) {
    return redirectTo(dashboardFor(role))
  }

  if (isAgentRoute && role === UserRole.ADMIN) {
    return redirectTo(dashboardFor(role))
  }

  if (isAuthPage && role) {
    return redirectTo(dashboardFor(role))
  }

  return handleI18nRouting(request)
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}
