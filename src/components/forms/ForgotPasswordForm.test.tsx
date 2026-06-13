import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { renderWithIntl } from "@/test/i18n"

import { ForgotPasswordForm } from "./ForgotPasswordForm"

const forgotPassword = vi.fn()

vi.mock("@/lib/auth", () => ({
  forgotPassword: (...args: unknown[]) => forgotPassword(...args),
}))

describe("ForgotPasswordForm", () => {
  it("shows a required field error when submitting an empty form", async () => {
    renderWithIntl(<ForgotPasswordForm />)

    await userEvent.click(screen.getByRole("button", { name: "Envoyer le lien" }))

    expect(await screen.findByText("Ce champ est requis")).toBeInTheDocument()
    expect(forgotPassword).not.toHaveBeenCalled()
  })

  it("always shows the generic confirmation message on submit", async () => {
    forgotPassword.mockResolvedValueOnce(undefined)
    renderWithIntl(<ForgotPasswordForm />)

    await userEvent.type(screen.getByLabelText("Email"), "jean@example.com")
    await userEvent.click(screen.getByRole("button", { name: "Envoyer le lien" }))

    expect(
      await screen.findByText(
        "Si un compte existe avec cette adresse, un lien de réinitialisation a été envoyé."
      )
    ).toBeInTheDocument()
    expect(forgotPassword).toHaveBeenCalledWith({ email: "jean@example.com" })
  })

  it("shows the generic confirmation message even if the request fails", async () => {
    forgotPassword.mockRejectedValueOnce(new Error("network error"))
    renderWithIntl(<ForgotPasswordForm />)

    await userEvent.type(screen.getByLabelText("Email"), "jean@example.com")
    await userEvent.click(screen.getByRole("button", { name: "Envoyer le lien" }))

    expect(
      await screen.findByText(
        "Si un compte existe avec cette adresse, un lien de réinitialisation a été envoyé."
      )
    ).toBeInTheDocument()
  })
})
