import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

import messages from "../../../messages/fr.json"
import { ListingStatus, ListingType, PaymentPeriod, PropertyType } from "@/types/enums"
import type { Listing } from "@/types/listing"
import type { Amenity, City } from "@/types/reference"

import { ListingForm } from "./ListingForm"

const getCities = vi.fn()
const getAmenities = vi.fn()
const getAgentListing = vi.fn()
const createListing = vi.fn()
const updateListing = vi.fn()
const push = vi.fn()

vi.mock("@/lib/listings", () => ({
  getCities: (...args: unknown[]) => getCities(...args),
}))

vi.mock("@/lib/agent", () => ({
  getAmenities: (...args: unknown[]) => getAmenities(...args),
  getAgentListing: (...args: unknown[]) => getAgentListing(...args),
  createListing: (...args: unknown[]) => createListing(...args),
  updateListing: (...args: unknown[]) => updateListing(...args),
}))

vi.mock("@/i18n/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/i18n/navigation")>()
  return {
    ...actual,
    useRouter: () => ({ push }),
  }
})

const cities: City[] = [
  {
    id: "city-1",
    name: "Douala",
    slug: "douala",
    neighborhoods: [{ id: "neigh-1", name: "Bonapriso" }],
  },
]

const amenities: Amenity[] = [{ id: "am-1", label: "Piscine", slug: "piscine" }]

function makeListing(overrides: Partial<Listing>): Listing {
  return {
    id: "1",
    referenceId: "IMM-2026-00001",
    slug: "appartement-bonapriso",
    title: "Appartement Bonapriso",
    description: "A".repeat(60),
    listingType: ListingType.RENT,
    propertyType: PropertyType.APARTMENT,
    status: ListingStatus.PENDING,
    price: 150000,
    paymentPeriod: PaymentPeriod.MONTHLY,
    bedrooms: 2,
    bathrooms: 1,
    areaM2: 60,
    address: null,
    agentPhone: "+237690123456",
    agentWhatsapp: null,
    rejectionReason: null,
    approvedAt: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    userId: "agent-1",
    cityId: "city-1",
    neighborhoodId: "neigh-1",
    cityName: "Douala",
    neighborhoodName: "Bonapriso",
    images: [{ id: "img-1", url: "https://example.com/1.jpg", storageKey: "1", order: 0 }],
    amenities: [{ id: "am-1", label: "Piscine", slug: "piscine" }],
    ...overrides,
  }
}

function renderForm(props: Parameters<typeof ListingForm>[0]) {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <NextIntlClientProvider locale="fr" messages={messages}>
        <ListingForm {...props} />
      </NextIntlClientProvider>
    </QueryClientProvider>
  )
}

beforeAll(() => {
  if (!URL.createObjectURL) {
    URL.createObjectURL = () => "blob:mock"
  }
})

describe("ListingForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getCities.mockResolvedValue(cities)
    getAmenities.mockResolvedValue(amenities)
  })

  it("submits a new listing with the expected form data", async () => {
    const user = userEvent.setup()
    createListing.mockResolvedValueOnce(makeListing({}))

    const { container } = renderForm({
      mode: "create",
      defaultContact: { phone: "+237690123456", whatsapp: "" },
    })

    await user.type(screen.getByLabelText("Titre de l'annonce"), "Bel appartement à vendre")
    await user.click(screen.getByRole("button", { name: "À vendre" }))

    await user.click(screen.getByRole("combobox", { name: "Ville" }))
    await user.click(await screen.findByRole("option", { name: "Douala" }))

    await user.click(screen.getByRole("combobox", { name: "Quartier" }))
    await user.click(await screen.findByRole("option", { name: "Bonapriso" }))

    const priceInput = screen.getByLabelText("Prix (FCFA)")
    await user.clear(priceInput)
    await user.type(priceInput, "150000")

    const descriptionInput = screen.getByLabelText("Description")
    await user.type(descriptionInput, "A".repeat(60))

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File([new Uint8Array(10)], "photo.jpg", { type: "image/jpeg" })
    await user.upload(fileInput, file)

    await user.click(screen.getByRole("button", { name: "Publier l'annonce" }))

    await waitFor(() => expect(createListing).toHaveBeenCalledTimes(1))

    const formData = createListing.mock.calls[0][0] as FormData
    expect(formData.get("title")).toBe("Bel appartement à vendre")
    expect(formData.get("listingType")).toBe(ListingType.SALE)
    expect(formData.get("cityId")).toBe("city-1")
    expect(formData.get("neighborhoodId")).toBe("neigh-1")
    expect(formData.get("price")).toBe("150000")
    expect(formData.get("description")).toBe("A".repeat(60))
    expect(formData.get("agentPhone")).toBe("+237690123456")
    expect((formData.get("photos") as File).name).toBe("photo.jpg")
    expect(formData.get("photoOrder")).toBeTruthy()

    await waitFor(() => expect(push).toHaveBeenCalledWith("/agent/mes-annonces"))
  }, 15000)

  it("pre-fills the form in edit mode and shows a warning for an approved listing", async () => {
    getAgentListing.mockResolvedValue(makeListing({ status: ListingStatus.APPROVED }))

    renderForm({
      mode: "edit",
      listingId: "1",
      defaultContact: { phone: "+237690123456", whatsapp: "" },
    })

    expect(await screen.findByDisplayValue("Appartement Bonapriso")).toBeInTheDocument()
    expect(screen.getByText("Annonce déjà approuvée")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Photo 1" })).toBeInTheDocument()
    expect(screen.getByText("Photo de couverture")).toBeInTheDocument()
  })
})
