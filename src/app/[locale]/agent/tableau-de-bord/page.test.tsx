import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithIntl } from "@/test/i18n"
import { getAgentListingStats, getRecentNotifications } from "@/lib/agent"
import { NotificationType } from "@/types/enums"

import AgentDashboardPage from "./page"

vi.mock("@/lib/agent", () => ({
  getAgentListingStats: vi.fn(),
  getRecentNotifications: vi.fn(),
}))

describe("AgentDashboardPage", () => {
  it("renders stat cards with counts from the API response", async () => {
    vi.mocked(getAgentListingStats).mockResolvedValue({
      total: 12,
      pending: 3,
      approved: 8,
      rejected: 1,
    })
    vi.mocked(getRecentNotifications).mockResolvedValue([])

    renderWithIntl(await AgentDashboardPage())

    expect(screen.getByText("Total annonces")).toBeInTheDocument()
    expect(screen.getByText("12")).toBeInTheDocument()
    expect(screen.getByText("En attente")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
    expect(screen.getByText("Approuvées")).toBeInTheDocument()
    expect(screen.getByText("8")).toBeInTheDocument()
    expect(screen.getByText("Rejetées")).toBeInTheDocument()
    expect(screen.getByText("1")).toBeInTheDocument()
  })

  it("shows an empty state when there is no recent activity", async () => {
    vi.mocked(getAgentListingStats).mockResolvedValue({
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    })
    vi.mocked(getRecentNotifications).mockResolvedValue([])

    renderWithIntl(await AgentDashboardPage())

    expect(screen.getByText("Aucune activité récente.")).toBeInTheDocument()
  })

  it("renders the recent activity feed from notifications", async () => {
    vi.mocked(getAgentListingStats).mockResolvedValue({
      total: 1,
      pending: 0,
      approved: 1,
      rejected: 0,
    })
    vi.mocked(getRecentNotifications).mockResolvedValue([
      {
        id: "n1",
        type: NotificationType.LISTING_APPROVED,
        message: "Votre annonce a été approuvée.",
        read: false,
        createdAt: "2026-01-01T00:00:00.000Z",
        userId: "agent-1",
        listingId: "listing-1",
      },
    ])

    renderWithIntl(await AgentDashboardPage())

    expect(screen.getByText("Votre annonce a été approuvée.")).toBeInTheDocument()
  })
})
