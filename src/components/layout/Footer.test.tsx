import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithIntl } from "@/test/i18n"
import { Footer } from "./Footer"

describe("Footer", () => {
  it("renders the platform name and tagline", async () => {
    renderWithIntl(await Footer())

    expect(screen.getByText("ImmoCM")).toBeInTheDocument()
    expect(screen.getByText(/Douala et Yaoundé/)).toBeInTheDocument()
  })

  it("links to the static pages", async () => {
    renderWithIntl(await Footer())

    expect(screen.getByRole("link", { name: "À propos" })).toHaveAttribute("href", "/fr/a-propos")
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/fr/contact")
    expect(screen.getByRole("link", { name: "Mentions légales" })).toHaveAttribute(
      "href",
      "/fr/mentions-legales"
    )
  })
})
