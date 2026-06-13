import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it, vi } from "vitest"

import messages from "../../../messages/fr.json"

import { LoginForm } from "./LoginForm"

const login = vi.fn()
const push = vi.fn()

vi.mock("@/lib/auth", () => ({
  login: (...args: unknown[]) => login(...args),
}))

vi.mock("@/i18n/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/i18n/navigation")>()
  return {
    ...actual,
    useRouter: () => ({ push }),
  }
})

function renderLoginForm() {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <NextIntlClientProvider locale="fr" messages={messages}>
        <LoginForm />
      </NextIntlClientProvider>
    </QueryClientProvider>
  )
}

describe("LoginForm", () => {
  it("shows required field errors when submitting an empty form", async () => {
    renderLoginForm()

    await userEvent.click(screen.getByRole("button", { name: "Se connecter" }))

    expect(await screen.findAllByText("Ce champ est requis")).not.toHaveLength(0)
    expect(login).not.toHaveBeenCalled()
  })

  it("redirects to the agent dashboard after a successful login", async () => {
    login.mockResolvedValueOnce({ user: { role: "AGENT" } })
    renderLoginForm()

    await userEvent.type(screen.getByLabelText("Email"), "jean@example.com")
    await userEvent.type(screen.getByLabelText("Mot de passe"), "password1")
    await userEvent.click(screen.getByRole("button", { name: "Se connecter" }))

    expect(await screen.findByRole("button")).toBeEnabled()
    expect(push).toHaveBeenCalledWith("/agent/tableau-de-bord")
  })

  it("redirects to the admin dashboard for admin users", async () => {
    login.mockResolvedValueOnce({ user: { role: "ADMIN" } })
    renderLoginForm()

    await userEvent.type(screen.getByLabelText("Email"), "admin@example.com")
    await userEvent.type(screen.getByLabelText("Mot de passe"), "password1")
    await userEvent.click(screen.getByRole("button", { name: "Se connecter" }))

    expect(await screen.findByRole("button")).toBeEnabled()
    expect(push).toHaveBeenCalledWith("/admin/tableau-de-bord")
  })

  it("disables the submit button while the request is pending", async () => {
    let resolveLogin: (value: { user: { role: string } }) => void = () => {}
    login.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve
        })
    )
    renderLoginForm()

    await userEvent.type(screen.getByLabelText("Email"), "jean@example.com")
    await userEvent.type(screen.getByLabelText("Mot de passe"), "password1")
    await userEvent.click(screen.getByRole("button", { name: "Se connecter" }))

    expect(screen.getByRole("button", { name: "Connexion..." })).toBeDisabled()

    resolveLogin({ user: { role: "AGENT" } })
    expect(await screen.findByRole("button", { name: "Se connecter" })).toBeEnabled()
  })
})
