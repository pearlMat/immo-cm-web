import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithIntl } from "@/test/i18n"
import { getAdminDashboardStats } from "@/lib/admin"

import AdminDashboardPage from "./page"

vi.mock("@/lib/admin", () => ({
  getAdminDashboardStats: vi.fn(),
}))

describe("AdminDashboardPage", () => {
  it("renders stat cards with counts from the API response", async () => {
    vi.mocked(getAdminDashboardStats).mockResolvedValue({
      pending: 5,
      approved: 20,
      rejected: 2,
      totalAgents: 30,
      newAgentsThisWeek: 4,
    })

    renderWithIntl(await AdminDashboardPage())

    expect(screen.getByText("5")).toBeInTheDocument()
    expect(screen.getByText("20")).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument()
    expect(screen.getByText("30")).toBeInTheDocument()
    expect(screen.getByText("4")).toBeInTheDocument()
  })

  it("renders a link to the pending review queue", async () => {
    vi.mocked(getAdminDashboardStats).mockResolvedValue({
      pending: 0,
      approved: 0,
      rejected: 0,
      totalAgents: 0,
      newAgentsThisWeek: 0,
    })

    renderWithIntl(await AdminDashboardPage())

    expect(screen.getByRole("link")).toHaveAttribute("href", "/fr/admin/annonces/en-attente")
  })

  it("falls back to zero counts when the stats API is unreachable", async () => {
    vi.mocked(getAdminDashboardStats).mockRejectedValue(new Error("network error"))

    renderWithIntl(await AdminDashboardPage())

    expect(screen.getAllByText("0")).toHaveLength(5)
  })
})
