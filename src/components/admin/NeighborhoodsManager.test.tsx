import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import messages from "../../../messages/fr.json"
import type { City } from "@/types/reference"

import { NeighborhoodsManager } from "./NeighborhoodsManager"

const getCities = vi.fn()

vi.mock("@/lib/listings", () => ({
  getCities: (...args: unknown[]) => getCities(...args),
}))

const createNeighborhood = vi.fn()
const updateNeighborhood = vi.fn()
const deleteNeighborhood = vi.fn()

vi.mock("@/lib/admin", () => ({
  createNeighborhood: (...args: unknown[]) => createNeighborhood(...args),
  updateNeighborhood: (...args: unknown[]) => updateNeighborhood(...args),
  deleteNeighborhood: (...args: unknown[]) => deleteNeighborhood(...args),
}))

const cities: City[] = [
  {
    id: "city-1",
    slug: "douala",
    name: "Douala",
    neighborhoods: [{ id: "n-1", name: "Bonapriso" }],
  },
  { id: "city-2", slug: "yaounde", name: "Yaoundé", neighborhoods: [] },
]

function renderManager() {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <NextIntlClientProvider locale="fr" messages={messages}>
        <NeighborhoodsManager />
      </NextIntlClientProvider>
    </QueryClientProvider>
  )
}

describe("NeighborhoodsManager", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getCities.mockResolvedValue(cities)
  })

  it("renders cities with their neighborhoods", async () => {
    renderManager()

    expect(await screen.findByText("Douala")).toBeInTheDocument()
    expect(screen.getByText("Bonapriso")).toBeInTheDocument()
    expect(screen.getByText("Yaoundé")).toBeInTheDocument()
    expect(screen.getByText("Aucun quartier.")).toBeInTheDocument()
  })

  it("adds a neighborhood to a city", async () => {
    createNeighborhood.mockResolvedValue({ id: "n-2", name: "Akwa" })

    renderManager()
    await screen.findByText("Douala")

    const user = userEvent.setup()
    const inputs = screen.getAllByPlaceholderText("Nom du quartier")
    await user.type(inputs[0], "Akwa")
    const addButtons = screen.getAllByRole("button", { name: "Ajouter" })
    await user.click(addButtons[0])

    await waitFor(() => expect(createNeighborhood).toHaveBeenCalledWith("city-1", "Akwa"))
  })

  it("renames a neighborhood", async () => {
    updateNeighborhood.mockResolvedValue({ id: "n-1", name: "Bonapriso 2" })

    renderManager()
    await screen.findByText("Bonapriso")

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: "Renommer" }))
    const input = screen.getByRole("textbox", { name: "Renommer Bonapriso" })
    await user.clear(input)
    await user.type(input, "Bonapriso 2")
    await user.click(screen.getByRole("button", { name: "Enregistrer" }))

    await waitFor(() => expect(updateNeighborhood).toHaveBeenCalledWith("n-1", "Bonapriso 2"))
  })

  it("deletes a neighborhood after confirmation", async () => {
    deleteNeighborhood.mockResolvedValue(undefined)

    renderManager()
    await screen.findByText("Bonapriso")

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: "Supprimer" }))
    await user.click(screen.getByRole("button", { name: "Confirmer" }))

    await waitFor(() => expect(deleteNeighborhood).toHaveBeenCalledWith("n-1"))
  })
})
