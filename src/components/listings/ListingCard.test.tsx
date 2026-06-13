import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithIntl } from "@/test/i18n"
import { ListingType, PaymentPeriod, PropertyType } from "@/types/enums"
import type { Listing } from "@/types/listing"

import { ListingCard } from "./ListingCard"

function makeListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: "1",
    referenceId: "IMM-2026-00001",
    slug: "bel-appartement-bonamoussadi",
    title: "Bel appartement à Bonamoussadi",
    description: "Un superbe appartement.",
    listingType: ListingType.RENT,
    propertyType: PropertyType.APARTMENT,
    status: "APPROVED" as Listing["status"],
    price: 150000,
    paymentPeriod: PaymentPeriod.MONTHLY,
    bedrooms: 2,
    bathrooms: 1,
    areaM2: 60,
    address: "Près du Total Bonamoussadi",
    rejectionReason: null,
    approvedAt: "2026-06-01T00:00:00.000Z",
    createdAt: "2026-06-03T00:00:00.000Z",
    updatedAt: "2026-06-03T00:00:00.000Z",
    userId: "agent-1",
    cityId: "city-1",
    neighborhoodId: "neighborhood-1",
    cityName: "Douala",
    neighborhoodName: "Bonamoussadi",
    images: [{ id: "img-1", url: "/photo.jpg", storageKey: "photo.jpg", order: 0 }],
    amenities: [],
    ...overrides,
  }
}

describe("ListingCard", () => {
  it("renders price, title, location, bedrooms, and date", () => {
    renderWithIntl(<ListingCard listing={makeListing()} />)

    expect(screen.getByText(/150 000 FCFA/)).toHaveTextContent("150 000 FCFA / Mensuel")
    expect(screen.getByText("Bel appartement à Bonamoussadi")).toBeInTheDocument()
    expect(screen.getByText("Bonamoussadi, Douala")).toBeInTheDocument()
    expect(screen.getByText("2 chambres")).toBeInTheDocument()
    expect(screen.getByText("03 juin 2026")).toBeInTheDocument()
  })

  it("renders listing type and property type badges", () => {
    renderWithIntl(<ListingCard listing={makeListing()} />)

    expect(screen.getByText("À louer")).toBeInTheDocument()
    expect(screen.getByText("Appartement")).toBeInTheDocument()
  })

  it("links to the listing detail page", () => {
    renderWithIntl(<ListingCard listing={makeListing()} />)

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/fr/annonces/bel-appartement-bonamoussadi"
    )
  })

  it("renders singular 'chambre' for a single bedroom", () => {
    renderWithIntl(<ListingCard listing={makeListing({ bedrooms: 1 })} />)

    expect(screen.getByText("1 chambre")).toBeInTheDocument()
  })
})
