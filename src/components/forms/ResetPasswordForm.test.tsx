import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { renderWithIntl } from "@/test/i18n"

import { ResetPasswordForm } from "./ResetPasswordForm"

const resetPassword = vi.fn()
const push = vi.fn()

vi.mock("@/lib/auth", () => ({
  resetPassword: (...args: unknown[]) => resetPassword(...args),
}))

vi.mock("@/i18n/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/i18n/navigation")>()
  return {
    ...actual,
    useRouter: () => ({ push }),
  }
})

describe("ResetPasswordForm", () => {
  it("shows required field errors when submitting an empty form", async () => {
    renderWithIntl(<ResetPasswordForm token="abc123" />)

    await userEvent.click(screen.getByRole("button", { name: "Réinitialiser" }))

    expect(await screen.findAllByText("Ce champ est requis")).not.toHaveLength(0)
    expect(resetPassword).not.toHaveBeenCalled()
  })

  it("shows a mismatch error when passwords differ", async () => {
    renderWithIntl(<ResetPasswordForm token="abc123" />)

    await userEvent.type(screen.getByLabelText("Mot de passe"), "password1")
    await userEvent.type(screen.getByLabelText("Confirmer le mot de passe"), "password2")
    await userEvent.click(screen.getByRole("button", { name: "Réinitialiser" }))

    expect(await screen.findByText("Les mots de passe ne correspondent pas")).toBeInTheDocument()
    expect(resetPassword).not.toHaveBeenCalled()
  })

  it("submits the token and password, then redirects to login", async () => {
    resetPassword.mockResolvedValueOnce(undefined)
    renderWithIntl(<ResetPasswordForm token="abc123" />)

    await userEvent.type(screen.getByLabelText("Mot de passe"), "password1")
    await userEvent.type(screen.getByLabelText("Confirmer le mot de passe"), "password1")
    await userEvent.click(screen.getByRole("button", { name: "Réinitialiser" }))

    expect(resetPassword).toHaveBeenCalledWith({ token: "abc123", password: "password1" })
    await screen.findByRole("button", { name: "Réinitialiser" })
    expect(push).toHaveBeenCalledWith("/connexion")
  })
})
