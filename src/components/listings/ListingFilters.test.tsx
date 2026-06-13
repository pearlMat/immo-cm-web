import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { renderWithIntl } from "@/test/i18n"
import { ListingType, PropertyType } from "@/types/enums"
import type { ListingFilters as ListingFiltersValue } from "@/types/filters"
import type { City } from "@/types/reference"

import { ListingFilters } from "./ListingFilters"

const push = vi.fn()

vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>()
  return {
    ...actual,
    useRouter: () => ({ push }),
    usePathname: () => "/",
  }
})

const cities: City[] = [
  {
    id: "city-douala",
    name: "Douala",
    slug: "douala",
    neighborhoods: [{ id: "neigh-bona", name: "Bonamoussadi" }],
  },
  { id: "city-yaounde", name: "Yaoundé", slug: "yaounde", neighborhoods: [] },
]

beforeEach(() => {
  push.mockClear()
})

function renderFilters(filters: ListingFiltersValue = {}) {
  return renderWithIntl(<ListingFilters cities={cities} filters={filters} basePath="/annonces" />)
}

describe("ListingFilters", () => {
  it("navigates with the listing type when a toggle is clicked", async () => {
    renderFilters()

    await userEvent.click(screen.getByRole("button", { name: "Louer" }))

    expect(push).toHaveBeenCalledWith("/fr/annonces?listingType=RENT")
  })

  it("navigates with the city id when a city radio is selected", async () => {
    renderFilters()

    await userEvent.click(screen.getByLabelText("Douala"))

    expect(push).toHaveBeenCalledWith("/fr/annonces?cityId=city-douala")
  })

  it("reflects the active city filter from the URL", () => {
    renderFilters({ cityId: "city-douala" })

    expect(screen.getByLabelText("Douala")).toBeChecked()
    expect(screen.getByLabelText("Yaoundé")).not.toBeChecked()
  })

  it("shows the neighborhood select only when the city has neighborhoods", () => {
    renderFilters({ cityId: "city-douala" })

    expect(screen.getByText("Quartier")).toBeInTheDocument()
  })

  it("navigates with the property type when a checkbox is toggled", async () => {
    renderFilters()

    await userEvent.click(screen.getByLabelText(PROPERTY_TYPE_LABEL))

    expect(push).toHaveBeenCalledWith(
      `/fr/annonces?propertyType=${PropertyType.APARTMENT}`
    )
  })

  it("navigates with bedrooms when a radio is selected", async () => {
    renderFilters()

    await userEvent.click(screen.getByLabelText("2"))

    expect(push).toHaveBeenCalledWith("/fr/annonces?bedrooms=2")
  })

  it("navigates with min/max price when 'Appliquer' is clicked", async () => {
    renderFilters()

    await userEvent.type(screen.getByLabelText("Min"), "50000")
    await userEvent.type(screen.getByLabelText("Max"), "200000")
    await userEvent.click(screen.getByRole("button", { name: "Appliquer" }))

    expect(push).toHaveBeenCalledWith("/fr/annonces?minPrice=50000&maxPrice=200000")
  })

  it("re-toggling an active listing type clears it", async () => {
    renderFilters({ listingType: ListingType.RENT })

    await userEvent.click(screen.getByRole("button", { name: "Louer" }))

    expect(push).toHaveBeenCalledWith("/fr/annonces")
  })
})

const PROPERTY_TYPE_LABEL = "Appartement"
