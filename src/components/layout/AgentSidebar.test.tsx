import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithIntl } from "@/test/i18n"
import { UserAccountType, UserRole, UserStatus } from "@/types/enums"
import type { User } from "@/types/user"

import { AgentSidebar } from "./AgentSidebar"

vi.mock("@/i18n/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/i18n/navigation")>()
  return {
    ...actual,
    usePathname: () => "/agent/mes-annonces",
  }
})

const user: User = {
  id: "1",
  email: "jean@example.com",
  emailVerified: true,
  fullName: "Jean Dupont",
  phone: "+237690123456",
  whatsapp: null,
  role: UserRole.AGENT,
  accountType: UserAccountType.AGENT,
  status: UserStatus.ACTIVE,
  profilePhoto: null,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
}

describe("AgentSidebar", () => {
  it("renders all nav items and the user's name", () => {
    renderWithIntl(<AgentSidebar user={user} />)

    expect(screen.getAllByText("Tableau de bord")).not.toHaveLength(0)
    expect(screen.getAllByText("Mes annonces")).not.toHaveLength(0)
    expect(screen.getAllByText("Nouvelle annonce")).not.toHaveLength(0)
    expect(screen.getAllByText("Notifications")).not.toHaveLength(0)
    expect(screen.getAllByText("Profil")).not.toHaveLength(0)
    expect(screen.getByText("Jean Dupont")).toBeInTheDocument()
  })

  it("marks the active nav item based on the current pathname", () => {
    renderWithIntl(<AgentSidebar user={user} />)

    const activeLinks = screen.getAllByRole("link", { name: /Mes annonces/i })
    expect(activeLinks[0]).toHaveAttribute("aria-current", "page")
  })
})
