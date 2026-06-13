import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it, vi } from "vitest"

import messages from "../../../messages/fr.json"

import { ChangePasswordForm } from "./ChangePasswordForm"

const changePassword = vi.fn()

vi.mock("@/lib/agent", () => ({
  changePassword: (...args: unknown[]) => changePassword(...args),
}))

function renderForm() {
  return render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <ChangePasswordForm />
    </NextIntlClientProvider>
  )
}

describe("ChangePasswordForm", () => {
  it("shows required field errors when submitting an empty form", async () => {
    renderForm()

    await userEvent.click(screen.getByRole("button", { name: "Enregistrer" }))

    expect(await screen.findAllByText("Ce champ est requis")).not.toHaveLength(0)
    expect(changePassword).not.toHaveBeenCalled()
  })

  it("shows a mismatch error when the confirmation password differs", async () => {
    renderForm()

    await userEvent.type(screen.getByLabelText("Mot de passe actuel"), "oldpassword1")
    await userEvent.type(screen.getByLabelText("Nouveau mot de passe"), "newpassword1")
    await userEvent.type(screen.getByLabelText("Confirmer le mot de passe"), "different1")
    await userEvent.click(screen.getByRole("button", { name: "Enregistrer" }))

    expect(await screen.findByText("Les mots de passe ne correspondent pas")).toBeInTheDocument()
    expect(changePassword).not.toHaveBeenCalled()
  })

  it("submits valid values and resets the form", async () => {
    changePassword.mockResolvedValueOnce(undefined)
    renderForm()

    await userEvent.type(screen.getByLabelText("Mot de passe actuel"), "oldpassword1")
    await userEvent.type(screen.getByLabelText("Nouveau mot de passe"), "newpassword1")
    await userEvent.type(screen.getByLabelText("Confirmer le mot de passe"), "newpassword1")
    await userEvent.click(screen.getByRole("button", { name: "Enregistrer" }))

    expect(await screen.findByRole("button", { name: "Enregistrer" })).toBeEnabled()
    expect(changePassword).toHaveBeenCalledWith({
      currentPassword: "oldpassword1",
      newPassword: "newpassword1",
    })
  })
})
