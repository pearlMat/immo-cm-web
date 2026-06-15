import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import messages from "../../../messages/fr.json"
import { ListingStatus, ListingType, PaymentPeriod, PropertyType } from "@/types/enums"
import type { City } from "@/types/reference"
import type { Listing, PaginatedListings } from "@/types/listing"

import { AllListingsTable } from "./AllListingsTable"

const getAdminListings = vi.fn()
const approveListing = vi.fn()
const rejectListing = vi.fn()
const deleteListing = vi.fn()
const bulkApproveListings = vi.fn()
const bulkRejectListings = vi.fn()
const bulkDeleteListings = vi.fn()

vi.mock("@/lib/admin", () => ({
  getAdminListings: (...args: unknown[]) => getAdminListings(...args),
  approveListing: (...args: unknown[]) => approveListing(...args),
  rejectListing: (...args: unknown[]) => rejectListing(...args),
  deleteListing: (...args: unknown[]) => deleteListing(...args),
  bulkApproveListings: (...args: unknown[]) => bulkApproveListings(...args),
  bulkRejectListings: (...args: unknown[]) => bulkRejectListings(...args),
  bulkDeleteListings: (...args: unknown[]) => bulkDeleteListings(...args),
}))

const getCities = vi.fn()

vi.mock("@/lib/listings", () => ({
  getCities: (...args: unknown[]) => getCities(...args),
}))

const cities: City[] = [
  { id: "city-1", slug: "douala", name: "Douala", neighborhoods: [] },
  { id: "city-2", slug: "yaounde", name: "Yaoundé", neighborhoods: [] },
]

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
  return { data, total: data.length, page: 1, limit: 20, totalPages: 1 }
}

function renderTable() {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <NextIntlClientProvider locale="fr" messages={messages}>
        <AllListingsTable />
      </NextIntlClientProvider>
    </QueryClientProvider>
  )
}

describe("AllListingsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getCities.mockResolvedValue(cities)
  })

  it("renders listings with status column", async () => {
    getAdminListings.mockResolvedValue(makeResult([makeListing()]))

    renderTable()

    expect(await screen.findByText("IMM-2026-00001")).toBeInTheDocument()
    expect(screen.getByText("En attente")).toBeInTheDocument()
  })

  it("shows an empty state when no listings match", async () => {
    getAdminListings.mockResolvedValue(makeResult([]))

    renderTable()

    expect(await screen.findByText("Aucune annonce ne correspond à ces critères.")).toBeInTheDocument()
  })

  it("refetches with the selected status filter", async () => {
    getAdminListings.mockResolvedValue(makeResult([makeListing()]))

    renderTable()
    await screen.findByText("IMM-2026-00001")

    const user = userEvent.setup()
    await user.click(screen.getByRole("combobox", { name: "Statut" }))
    await user.click(await screen.findByRole("option", { name: "Approuvée" }))

    await waitFor(() =>
      expect(getAdminListings).toHaveBeenCalledWith(
        expect.objectContaining({ status: ListingStatus.APPROVED, page: 1 })
      )
    )
  })

  it("shows bulk actions once a row is selected and applies bulk approve", async () => {
    getAdminListings.mockResolvedValue(makeResult([makeListing()]))
    bulkApproveListings.mockResolvedValue(undefined)

    renderTable()
    await screen.findByText("IMM-2026-00001")

    const user = userEvent.setup()
    await user.click(screen.getByRole("checkbox", { name: /Sélectionner IMM-2026-00001/ }))

    expect(screen.getByText("1 sélectionnée(s)")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Approuver tout" }))
    await user.click(screen.getByRole("button", { name: "Confirmer" }))

    await waitFor(() => expect(bulkApproveListings).toHaveBeenCalledWith(["1"]))
  })
})
