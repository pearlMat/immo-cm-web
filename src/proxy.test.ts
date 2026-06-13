import { NextRequest } from "next/server"
import { describe, expect, it } from "vitest"

import { UserRole } from "@/types/enums"
import { AUTH_COOKIE_NAME } from "@/lib/auth-server"

import { dashboardFor, decodeRole, proxy } from "./proxy"

function makeToken(role: UserRole | undefined): string {
  const payload = Buffer.from(JSON.stringify({ role })).toString("base64url")
  return `header.${payload}.signature`
}

function makeRequest(path: string, role?: UserRole): NextRequest {
  const headers = new Headers()
  if (role) {
    headers.set("cookie", `${AUTH_COOKIE_NAME}=${makeToken(role)}`)
  }
  return new NextRequest(new URL(path, "http://localhost:3001"), { headers })
}

describe("decodeRole", () => {
  it("decodes the role from a JWT payload", () => {
    expect(decodeRole(makeToken(UserRole.AGENT))).toBe(UserRole.AGENT)
  })

  it("returns null for a malformed token", () => {
    expect(decodeRole("not-a-jwt")).toBeNull()
  })
})

describe("dashboardFor", () => {
  it("routes admins to the admin dashboard", () => {
    expect(dashboardFor(UserRole.ADMIN)).toBe("/admin/tableau-de-bord")
  })

  it("routes agents and unauthenticated users to the agent dashboard", () => {
    expect(dashboardFor(UserRole.AGENT)).toBe("/agent/tableau-de-bord")
    expect(dashboardFor(null)).toBe("/agent/tableau-de-bord")
  })
})

describe("proxy", () => {
  it("redirects requests without a locale prefix to the default locale", () => {
    const res = proxy(makeRequest("/annonces"))

    expect(res.headers.get("location")).toBe("http://localhost:3001/fr/annonces")
  })

  it("redirects unauthenticated users away from /agent routes", () => {
    const res = proxy(makeRequest("/fr/agent/tableau-de-bord"))

    expect(res.headers.get("location")).toBe("http://localhost:3001/fr/connexion")
  })

  it("redirects unauthenticated users away from /admin routes", () => {
    const res = proxy(makeRequest("/fr/admin/tableau-de-bord"))

    expect(res.headers.get("location")).toBe("http://localhost:3001/fr/connexion")
  })

  it("allows an agent to access /agent routes", () => {
    const res = proxy(makeRequest("/fr/agent/tableau-de-bord", UserRole.AGENT))

    expect(res.headers.get("location")).toBeNull()
  })

  it("redirects an agent away from /admin routes", () => {
    const res = proxy(makeRequest("/fr/admin/tableau-de-bord", UserRole.AGENT))

    expect(res.headers.get("location")).toBe("http://localhost:3001/fr/agent/tableau-de-bord")
  })

  it("redirects an admin away from /agent routes", () => {
    const res = proxy(makeRequest("/fr/agent/tableau-de-bord", UserRole.ADMIN))

    expect(res.headers.get("location")).toBe("http://localhost:3001/fr/admin/tableau-de-bord")
  })

  it("redirects an authenticated agent away from the login page", () => {
    const res = proxy(makeRequest("/fr/connexion", UserRole.AGENT))

    expect(res.headers.get("location")).toBe("http://localhost:3001/fr/agent/tableau-de-bord")
  })

  it("allows unauthenticated users to view the login page", () => {
    const res = proxy(makeRequest("/fr/connexion"))

    expect(res.headers.get("location")).toBeNull()
  })

  it("allows requests with the English locale prefix", () => {
    const res = proxy(makeRequest("/en/annonces"))

    expect(res.headers.get("location")).toBeNull()
  })
})
