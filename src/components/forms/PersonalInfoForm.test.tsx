import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import messages from "../../../messages/fr.json"

import { PersonalInfoForm } from "./PersonalInfoForm"

const updateProfile = vi.fn()

vi.mock("@/lib/agent", () => ({
  updateProfile: (...args: unknown[]) => updateProfile(...args),
}))

function renderForm() {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <NextIntlClientProvider locale="fr" messages={messages}>
        <PersonalInfoForm
          defaultValues={{ fullName: "Jean Dupont", phone: "+237690123456", whatsapp: "" }}
        />
      </NextIntlClientProvider>
    </QueryClientProvider>
  )
}

describe("PersonalInfoForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("submits updated values", async () => {
    updateProfile.mockResolvedValueOnce({})
    renderForm()

    await userEvent.clear(screen.getByLabelText("Nom complet"))
    await userEvent.type(screen.getByLabelText("Nom complet"), "Marie Curie")
    await userEvent.click(screen.getByRole("button", { name: "Enregistrer" }))

    expect(await screen.findByRole("button", { name: "Enregistrer" })).toBeEnabled()
    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: "Marie Curie", phone: "+237690123456" })
    )
  })

  it("shows a required field error when the full name is cleared", async () => {
    renderForm()

    await userEvent.clear(screen.getByLabelText("Nom complet"))
    await userEvent.click(screen.getByRole("button", { name: "Enregistrer" }))

    expect(await screen.findByText("Ce champ est requis")).toBeInTheDocument()
    expect(updateProfile).not.toHaveBeenCalled()
  })
})
