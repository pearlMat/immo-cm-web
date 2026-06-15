import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it, vi } from "vitest"

import messages from "../../../messages/fr.json"
import { ListingStatus, ListingType, PaymentPeriod, PropertyType } from "@/types/enums"
import type { Listing, PaginatedListings } from "@/types/listing"

import { PendingQueueTable } from "./PendingQueueTable"

const getAdminListings = vi.fn()
const approveListing = vi.fn()
const rejectListing = vi.fn()

vi.mock("@/lib/admin", () => ({
  getAdminListings: (...args: unknown[]) => getAdminListings(...args),
  approveListing: (...args: unknown[]) => approveListing(...args),
  rejectListing: (...args: unknown[]) => rejectListing(...args),
}))

function makeListing(overrides: Partial<Listing> = {}): Listing {
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
    agentName: "Jean Dupont",
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
        <PendingQueueTable />
      </NextIntlClientProvider>
    </QueryClientProvider>
  )
}

describe("PendingQueueTable", () => {
  it("fetches pending listings sorted oldest first", async () => {
    getAdminListings.mockResolvedValue(makeResult([makeListing()]))

    renderTable()

    await screen.findByText("IMM-2026-00001")
    expect(getAdminListings).toHaveBeenCalledWith(
      expect.objectContaining({ status: ListingStatus.PENDING, sort: "oldest" })
    )
  })

  it("shows an empty state when there are no pending listings", async () => {
    getAdminListings.mockResolvedValue(makeResult([]))

    renderTable()

    expect(await screen.findByText("Aucune annonce en attente.")).toBeInTheDocument()
  })

  it("approves a listing after confirming the modal", async () => {
    getAdminListings.mockResolvedValue(makeResult([makeListing()]))
    approveListing.mockResolvedValue(undefined)

    renderTable()

    await userEvent.click(await screen.findByRole("button", { name: "Approuver" }))
    await userEvent.click(screen.getByRole("button", { name: "Confirmer" }))

    await waitFor(() => expect(approveListing).toHaveBeenCalledWith("1"))
  })

  it("rejects a listing with a reason after confirming the modal", async () => {
    getAdminListings.mockResolvedValue(makeResult([makeListing()]))
    rejectListing.mockResolvedValue(undefined)

    renderTable()

    await userEvent.click(await screen.findByRole("button", { name: "Rejeter" }))
    await userEvent.type(
      screen.getByPlaceholderText("Expliquez pourquoi cette annonce est rejetée..."),
      "Photos de mauvaise qualité"
    )
    await userEvent.click(screen.getByRole("button", { name: "Confirmer" }))

    await waitFor(() =>
      expect(rejectListing).toHaveBeenCalledWith("1", "Photos de mauvaise qualité")
    )
  })
})
