import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it, vi } from "vitest"

import messages from "../../../messages/fr.json"
import { ListingStatus, ListingType, PaymentPeriod, PropertyType } from "@/types/enums"
import type { Listing, ListingStatusLog } from "@/types/listing"

import { ListingReviewPanel } from "./ListingReviewPanel"

const getAdminListing = vi.fn()
const approveListing = vi.fn()
const rejectListing = vi.fn()
const deleteListing = vi.fn()

vi.mock("@/lib/admin", () => ({
  getAdminListing: (...args: unknown[]) => getAdminListing(...args),
  approveListing: (...args: unknown[]) => approveListing(...args),
  rejectListing: (...args: unknown[]) => rejectListing(...args),
  deleteListing: (...args: unknown[]) => deleteListing(...args),
}))

const push = vi.fn()
vi.mock("@/i18n/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/i18n/navigation")>()
  return {
    ...actual,
    useRouter: () => ({ push }),
  }
})

function makeListing(overrides: Partial<Listing> = {}): Listing & { statusLog: ListingStatusLog[] } {
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
    statusLog: [
      { id: "log-1", status: ListingStatus.PENDING, reason: null, createdAt: "2026-01-01" },
    ],
    ...overrides,
  }
}

function renderPanel() {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <NextIntlClientProvider locale="fr" messages={messages}>
        <ListingReviewPanel id="1" />
      </NextIntlClientProvider>
    </QueryClientProvider>
  )
}

describe("ListingReviewPanel", () => {
  it("shows approve/reject actions and status history for a PENDING listing", async () => {
    getAdminListing.mockResolvedValue(makeListing())

    renderPanel()

    expect(await screen.findByText("Appartement Bonapriso")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Approuver" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Rejeter" })).toBeInTheDocument()
    expect(screen.getByText("En attente")).toBeInTheDocument()
  })

  it("hides approve/reject actions for an APPROVED listing", async () => {
    getAdminListing.mockResolvedValue(
      makeListing({
        status: ListingStatus.APPROVED,
        statusLog: [
          { id: "log-1", status: ListingStatus.PENDING, reason: null, createdAt: "2026-01-01" },
          { id: "log-2", status: ListingStatus.APPROVED, reason: null, createdAt: "2026-01-02" },
        ],
      })
    )

    renderPanel()

    await screen.findByText("Appartement Bonapriso")
    expect(screen.queryByRole("button", { name: "Approuver" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Rejeter" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Supprimer" })).toBeInTheDocument()
  })

  it("approves the listing after confirming the modal", async () => {
    getAdminListing.mockResolvedValue(makeListing())
    approveListing.mockResolvedValue(undefined)

    renderPanel()

    await screen.findByText("Appartement Bonapriso")
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: "Approuver" }))
    await user.click(screen.getByRole("button", { name: "Confirmer" }))

    await waitFor(() => expect(approveListing).toHaveBeenCalledWith("1"))
  })

  it("rejects the listing with a reason after confirming the modal", async () => {
    getAdminListing.mockResolvedValue(makeListing())
    rejectListing.mockResolvedValue(undefined)

    renderPanel()

    await screen.findByText("Appartement Bonapriso")
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: "Rejeter" }))
    await user.type(
      screen.getByPlaceholderText("Expliquez pourquoi cette annonce est rejetée..."),
      "Photos de mauvaise qualité"
    )
    await user.click(screen.getByRole("button", { name: "Confirmer" }))

    await waitFor(() => expect(rejectListing).toHaveBeenCalledWith("1", "Photos de mauvaise qualité"))
  })

  it("deletes the listing with a reason and redirects to the listings page", async () => {
    getAdminListing.mockResolvedValue(makeListing())
    deleteListing.mockResolvedValue(undefined)

    renderPanel()

    await screen.findByText("Appartement Bonapriso")
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: "Supprimer" }))
    await user.type(
      screen.getByPlaceholderText("Expliquez pourquoi cette annonce est rejetée..."),
      "Annonce frauduleuse signalée"
    )
    await user.click(screen.getByRole("button", { name: "Confirmer" }))

    await waitFor(() => expect(deleteListing).toHaveBeenCalledWith("1", "Annonce frauduleuse signalée"))
    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/annonces"))
  })
})
