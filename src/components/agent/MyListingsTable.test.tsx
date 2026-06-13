import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it, vi } from "vitest"

import messages from "../../../messages/fr.json"
import { ListingStatus, ListingType, PaymentPeriod, PropertyType } from "@/types/enums"
import type { Listing, PaginatedListings } from "@/types/listing"

import { MyListingsTable } from "./MyListingsTable"

const getAgentListings = vi.fn()
const deleteAgentListing = vi.fn()
const resubmitAgentListing = vi.fn()

vi.mock("@/lib/agent", () => ({
  getAgentListings: (...args: unknown[]) => getAgentListings(...args),
  deleteAgentListing: (...args: unknown[]) => deleteAgentListing(...args),
  resubmitAgentListing: (...args: unknown[]) => resubmitAgentListing(...args),
}))

function makeListing(overrides: Partial<Listing>): Listing {
  return {
    id: "1",
    referenceId: "IMM-2026-00001",
    slug: "appartement-bonapriso",
    title: "Appartement Bonapriso",
    description: "Un bel appartement.",
    listingType: ListingType.RENT,
    propertyType: PropertyType.APARTMENT,
    status: ListingStatus.PENDING,
    price: 150000,
    paymentPeriod: PaymentPeriod.MONTHLY,
    bedrooms: 2,
    bathrooms: 1,
    areaM2: 60,
    address: null,
    rejectionReason: null,
    approvedAt: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    userId: "agent-1",
    cityId: "city-1",
    neighborhoodId: "neigh-1",
    cityName: "Douala",
    neighborhoodName: "Bonapriso",
    images: [],
    amenities: [],
    ...overrides,
  }
}

function makeResult(data: Listing[]): PaginatedListings {
  return { data, total: data.length, page: 1, limit: 50, totalPages: 1 }
}

function renderTable() {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <NextIntlClientProvider locale="fr" messages={messages}>
        <MyListingsTable />
      </NextIntlClientProvider>
    </QueryClientProvider>
  )
}

describe("MyListingsTable", () => {
  it("renders status badges and shows Modifier for a PENDING listing", async () => {
    getAgentListings.mockResolvedValue(makeResult([makeListing({ status: ListingStatus.PENDING })]))

    renderTable()

    const table = await screen.findByRole("table")
    expect(within(table).getByText("En attente")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Modifier" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Soumettre à nouveau" })).not.toBeInTheDocument()
  })

  it("shows Soumettre à nouveau and Modifier for a REJECTED listing", async () => {
    getAgentListings.mockResolvedValue(makeResult([makeListing({ status: ListingStatus.REJECTED })]))

    renderTable()

    expect(await screen.findByText("Rejetée")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Modifier" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Soumettre à nouveau" })).toBeInTheDocument()
  })

  it("hides Modifier and Soumettre à nouveau for an APPROVED listing", async () => {
    getAgentListings.mockResolvedValue(makeResult([makeListing({ status: ListingStatus.APPROVED })]))

    renderTable()

    expect(await screen.findByText("Approuvée")).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Modifier" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Soumettre à nouveau" })).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Voir" })).toBeInTheDocument()
  })

  it("re-fetches with the selected status when a filter tab is clicked", async () => {
    getAgentListings.mockResolvedValue(makeResult([makeListing({ status: ListingStatus.PENDING })]))

    renderTable()

    await screen.findByText("En attente")
    expect(getAgentListings).toHaveBeenCalledWith(
      expect.objectContaining({ status: undefined })
    )

    await userEvent.click(screen.getByRole("tab", { name: "Approuvées" }))

    await waitFor(() => {
      expect(getAgentListings).toHaveBeenCalledWith(
        expect.objectContaining({ status: ListingStatus.APPROVED })
      )
    })
  })
})
