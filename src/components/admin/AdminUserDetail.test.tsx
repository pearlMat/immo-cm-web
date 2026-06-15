import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import messages from "../../../messages/fr.json"
import { UserAccountType, UserRole, UserStatus } from "@/types/enums"
import type { AdminUser } from "@/types/user"

import { AdminUserDetail } from "./AdminUserDetail"

const getAdminUser = vi.fn()
const suspendUser = vi.fn()
const reactivateUser = vi.fn()
const deleteUser = vi.fn()

vi.mock("@/lib/admin", () => ({
  getAdminUser: (...args: unknown[]) => getAdminUser(...args),
  suspendUser: (...args: unknown[]) => suspendUser(...args),
  reactivateUser: (...args: unknown[]) => reactivateUser(...args),
  deleteUser: (...args: unknown[]) => deleteUser(...args),
}))

const push = vi.fn()
vi.mock("@/i18n/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/i18n/navigation")>()
  return {
    ...actual,
    useRouter: () => ({ push }),
  }
})

function makeUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id: "1",
    email: "jean@example.com",
    emailVerified: true,
    fullName: "Jean Dupont",
    phone: "+237600000000",
    whatsapp: null,
    role: UserRole.AGENT,
    accountType: UserAccountType.AGENT,
    status: UserStatus.ACTIVE,
    profilePhoto: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    listingsCount: 3,
    ...overrides,
  }
}

function renderDetail(id = "1") {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <NextIntlClientProvider locale="fr" messages={messages}>
        <AdminUserDetail id={id} />
      </NextIntlClientProvider>
    </QueryClientProvider>
  )
}

describe("AdminUserDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders user details", async () => {
    getAdminUser.mockResolvedValue(makeUser())

    renderDetail()

    expect(await screen.findByText("Jean Dupont")).toBeInTheDocument()
    expect(screen.getByText("jean@example.com")).toBeInTheDocument()
    expect(screen.getByText("Actif")).toBeInTheDocument()
  })

  it("shows not found when user is missing", async () => {
    getAdminUser.mockResolvedValue(undefined)

    renderDetail()

    expect(await screen.findByText("Utilisateur introuvable.")).toBeInTheDocument()
  })

  it("deletes the user and redirects", async () => {
    getAdminUser.mockResolvedValue(makeUser())
    deleteUser.mockResolvedValue(undefined)

    renderDetail()
    await screen.findByText("Jean Dupont")

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: "Supprimer" }))
    await user.click(screen.getByRole("button", { name: "Confirmer" }))

    await waitFor(() => expect(deleteUser).toHaveBeenCalledWith("1"))
    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/utilisateurs"))
  })
})
