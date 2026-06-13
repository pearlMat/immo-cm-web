import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithIntl } from "@/test/i18n"
import { UserAccountType, UserRole, UserStatus } from "@/types/enums"
import type { User } from "@/types/user"

import { getServerUser } from "@/lib/auth-server"
import { Header } from "./Header"

vi.mock("@/lib/auth-server", () => ({
  getServerUser: vi.fn(),
}))

function makeUser(overrides: Partial<User>): User {
  return {
    id: "1",
    email: "agent@example.com",
    emailVerified: true,
    fullName: "Awa Mballa",
    phone: "+237698765432",
    whatsapp: null,
    role: UserRole.AGENT,
    accountType: UserAccountType.AGENT,
    status: UserStatus.ACTIVE,
    profilePhoto: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  }
}

describe("Header", () => {
  it("renders the main navigation links", async () => {
    vi.mocked(getServerUser).mockResolvedValue(null)

    renderWithIntl(await Header())

    expect(screen.getByRole("link", { name: "Accueil" })).toHaveAttribute("href", "/fr")
    expect(screen.getByRole("link", { name: "Annonces" })).toHaveAttribute("href", "/fr/annonces")
    expect(screen.getByRole("link", { name: "Mettre une annonce" })).toHaveAttribute(
      "href",
      "/fr/agent/annonces/nouvelle"
    )
  })

  it("shows a login link when unauthenticated", async () => {
    vi.mocked(getServerUser).mockResolvedValue(null)

    renderWithIntl(await Header())

    expect(screen.getByRole("link", { name: "Connexion" })).toHaveAttribute("href", "/fr/connexion")
  })

  it("links an agent to the agent dashboard", async () => {
    vi.mocked(getServerUser).mockResolvedValue(makeUser({ role: UserRole.AGENT, fullName: "Awa Mballa" }))

    renderWithIntl(await Header())

    expect(screen.getByRole("link", { name: "Awa Mballa" })).toHaveAttribute(
      "href",
      "/fr/agent/tableau-de-bord"
    )
  })

  it("links an admin to the admin dashboard", async () => {
    vi.mocked(getServerUser).mockResolvedValue(
      makeUser({ role: UserRole.ADMIN, accountType: null, fullName: "Admin User" })
    )

    renderWithIntl(await Header())

    expect(screen.getByRole("link", { name: "Admin User" })).toHaveAttribute(
      "href",
      "/fr/admin/tableau-de-bord"
    )
  })
})
