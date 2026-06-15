import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import messages from "../../../messages/fr.json"
import { UserAccountType, UserRole, UserStatus } from "@/types/enums"
import type { AdminUser, PaginatedUsers } from "@/types/user"

import { AdminUsersTable } from "./AdminUsersTable"

const getAdminUsers = vi.fn()
const suspendUser = vi.fn()
const reactivateUser = vi.fn()
const deleteUser = vi.fn()

vi.mock("@/lib/admin", () => ({
  getAdminUsers: (...args: unknown[]) => getAdminUsers(...args),
  suspendUser: (...args: unknown[]) => suspendUser(...args),
  reactivateUser: (...args: unknown[]) => reactivateUser(...args),
  deleteUser: (...args: unknown[]) => deleteUser(...args),
}))

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

function makeResult(data: AdminUser[]): PaginatedUsers {
  return { data, total: data.length, page: 1, limit: 20, totalPages: 1 }
}

function renderTable() {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <NextIntlClientProvider locale="fr" messages={messages}>
        <AdminUsersTable />
      </NextIntlClientProvider>
    </QueryClientProvider>
  )
}

describe("AdminUsersTable", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders users with status badge", async () => {
    getAdminUsers.mockResolvedValue(makeResult([makeUser()]))

    renderTable()

    expect(await screen.findByText("Jean Dupont")).toBeInTheDocument()
    expect(screen.getByText("Actif")).toBeInTheDocument()
  })

  it("shows an empty state when no users match", async () => {
    getAdminUsers.mockResolvedValue(makeResult([]))

    renderTable()

    expect(await screen.findByText("Aucun utilisateur ne correspond à ces critères.")).toBeInTheDocument()
  })

  it("refetches with the selected role filter", async () => {
    getAdminUsers.mockResolvedValue(makeResult([makeUser()]))

    renderTable()
    await screen.findByText("Jean Dupont")

    const user = userEvent.setup()
    await user.click(screen.getByRole("combobox", { name: "Rôle" }))
    await user.click(await screen.findByRole("option", { name: "Agents" }))

    await waitFor(() =>
      expect(getAdminUsers).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.AGENT, page: 1 })
      )
    )
  })

  it("suspends an active user", async () => {
    getAdminUsers.mockResolvedValue(makeResult([makeUser()]))
    suspendUser.mockResolvedValue(undefined)

    renderTable()
    await screen.findByText("Jean Dupont")

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: "Suspendre" }))
    await user.click(screen.getByRole("button", { name: "Confirmer" }))

    await waitFor(() => expect(suspendUser).toHaveBeenCalledWith("1"))
  })

  it("shows reactivate action for a suspended user", async () => {
    getAdminUsers.mockResolvedValue(makeResult([makeUser({ status: UserStatus.SUSPENDED })]))

    renderTable()

    expect(await screen.findByRole("button", { name: "Réactiver" })).toBeInTheDocument()
  })
})
