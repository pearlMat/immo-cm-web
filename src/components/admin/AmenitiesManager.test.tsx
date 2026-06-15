import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import messages from "../../../messages/fr.json"
import type { Amenity } from "@/types/reference"

import { AmenitiesManager } from "./AmenitiesManager"

const getAmenities = vi.fn()

vi.mock("@/lib/agent", () => ({
  getAmenities: (...args: unknown[]) => getAmenities(...args),
}))

const createAmenity = vi.fn()
const updateAmenity = vi.fn()
const deleteAmenity = vi.fn()

vi.mock("@/lib/admin", () => ({
  createAmenity: (...args: unknown[]) => createAmenity(...args),
  updateAmenity: (...args: unknown[]) => updateAmenity(...args),
  deleteAmenity: (...args: unknown[]) => deleteAmenity(...args),
}))

const amenities: Amenity[] = [{ id: "a-1", label: "Piscine", slug: "piscine" }]

function renderManager() {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <NextIntlClientProvider locale="fr" messages={messages}>
        <AmenitiesManager />
      </NextIntlClientProvider>
    </QueryClientProvider>
  )
}

describe("AmenitiesManager", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders amenities with their slug", async () => {
    getAmenities.mockResolvedValue(amenities)

    renderManager()

    expect(await screen.findByText("Piscine")).toBeInTheDocument()
    expect(screen.getByText("piscine")).toBeInTheDocument()
  })

  it("shows an empty state when there are no amenities", async () => {
    getAmenities.mockResolvedValue([])

    renderManager()

    expect(await screen.findByText("Aucun équipement.")).toBeInTheDocument()
  })

  it("adds a new amenity", async () => {
    getAmenities.mockResolvedValue(amenities)
    createAmenity.mockResolvedValue({ id: "a-2", label: "Climatisation", slug: "climatisation" })

    renderManager()
    await screen.findByText("Piscine")

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText("Nom de l'équipement"), "Climatisation")
    await user.click(screen.getByRole("button", { name: "Ajouter" }))

    await waitFor(() => expect(createAmenity).toHaveBeenCalledWith("Climatisation"))
  })

  it("edits an amenity label", async () => {
    getAmenities.mockResolvedValue(amenities)
    updateAmenity.mockResolvedValue({ id: "a-1", label: "Piscine privée", slug: "piscine-privee" })

    renderManager()
    await screen.findByText("Piscine")

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: "Modifier" }))
    const input = screen.getByRole("textbox", { name: "Modifier Piscine" })
    await user.clear(input)
    await user.type(input, "Piscine privée")
    await user.click(screen.getByRole("button", { name: "Enregistrer" }))

    await waitFor(() => expect(updateAmenity).toHaveBeenCalledWith("a-1", "Piscine privée"))
  })

  it("deletes an amenity after confirmation", async () => {
    getAmenities.mockResolvedValue(amenities)
    deleteAmenity.mockResolvedValue(undefined)

    renderManager()
    await screen.findByText("Piscine")

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: "Supprimer" }))
    await user.click(screen.getByRole("button", { name: "Confirmer" }))

    await waitFor(() => expect(deleteAmenity).toHaveBeenCalledWith("a-1"))
  })
})
