import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { renderWithIntl } from "@/test/i18n"

import { RegisterForm } from "./RegisterForm"

const register = vi.fn()

vi.mock("@/lib/auth", () => ({
  register: (...args: unknown[]) => register(...args),
}))

describe("RegisterForm", () => {
  it("shows required field errors when submitting an empty form", async () => {
    renderWithIntl(<RegisterForm />)

    await userEvent.click(screen.getByRole("button", { name: "S'inscrire" }))

    expect(await screen.findAllByText("Ce champ est requis")).not.toHaveLength(0)
    expect(register).not.toHaveBeenCalled()
  })

  it("shows a mismatch error when passwords differ", async () => {
    renderWithIntl(<RegisterForm />)

    await userEvent.type(screen.getByLabelText("Nom complet"), "Jean Dupont")
    await userEvent.type(screen.getByLabelText("Email"), "jean@example.com")
    await userEvent.type(screen.getByLabelText("Téléphone"), "+237 690 123 456")
    await userEvent.type(screen.getByLabelText("Mot de passe"), "password1")
    await userEvent.type(screen.getByLabelText("Confirmer le mot de passe"), "password2")
    await userEvent.click(screen.getByRole("button", { name: "S'inscrire" }))

    expect(await screen.findByText("Les mots de passe ne correspondent pas")).toBeInTheDocument()
    expect(register).not.toHaveBeenCalled()
  })

  it("shows a success message after a successful submission", async () => {
    register.mockResolvedValueOnce(undefined)
    renderWithIntl(<RegisterForm />)

    await userEvent.type(screen.getByLabelText("Nom complet"), "Jean Dupont")
    await userEvent.type(screen.getByLabelText("Email"), "jean@example.com")
    await userEvent.type(screen.getByLabelText("Téléphone"), "+237 690 123 456")
    await userEvent.type(screen.getByLabelText("Mot de passe"), "password1")
    await userEvent.type(screen.getByLabelText("Confirmer le mot de passe"), "password1")
    await userEvent.click(screen.getByRole("button", { name: "S'inscrire" }))

    expect(await screen.findByText("Vérifiez votre email")).toBeInTheDocument()
    expect(register).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "Jean Dupont",
        email: "jean@example.com",
        phone: "+237690123456",
      })
    )
  })
})
