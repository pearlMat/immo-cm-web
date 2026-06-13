import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { renderWithIntl } from "@/test/i18n"
import type { City } from "@/types/reference"

import { SearchBar } from "./SearchBar"

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
  { id: "city-douala", name: "Douala", slug: "douala", neighborhoods: [] },
  { id: "city-yaounde", name: "Yaoundé", slug: "yaounde", neighborhoods: [] },
]

describe("SearchBar", () => {
  it("defaults to 'Louer' and navigates to /annonces with listingType on search", async () => {
    renderWithIntl(<SearchBar cities={cities} />)

    expect(screen.getByRole("button", { name: "Louer" })).toHaveAttribute("aria-pressed", "true")

    await userEvent.click(screen.getByRole("button", { name: "Rechercher" }))

    expect(push).toHaveBeenCalledWith("/fr/annonces?listingType=RENT")
  })

  it("switches to 'Acheter' and includes it in the search navigation", async () => {
    renderWithIntl(<SearchBar cities={cities} />)

    await userEvent.click(screen.getByRole("button", { name: "Acheter" }))
    await userEvent.click(screen.getByRole("button", { name: "Rechercher" }))

    expect(push).toHaveBeenCalledWith("/fr/annonces?listingType=SALE")
  })
})
