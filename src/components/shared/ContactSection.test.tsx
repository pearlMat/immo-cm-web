import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithIntl } from "@/test/i18n"
import { ContactSection } from "./ContactSection"

describe("ContactSection", () => {
  it("renders the formatted phone number and a tel: link", () => {
    renderWithIntl(<ContactSection agentPhone="+237699112233" agentWhatsapp={null} />)

    expect(screen.getByText("+237 699 112 233")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Appeler" })).toHaveAttribute(
      "href",
      "tel:+237699112233"
    )
  })

  it("renders a WhatsApp deep link when agentWhatsapp is provided", () => {
    renderWithIntl(<ContactSection agentPhone="+237699112233" agentWhatsapp="+237699112233" />)

    expect(screen.getByRole("link", { name: "Écrire sur WhatsApp" })).toHaveAttribute(
      "href",
      "https://wa.me/237699112233"
    )
  })

  it("omits the WhatsApp action when agentWhatsapp is not provided", () => {
    renderWithIntl(<ContactSection agentPhone="+237699112233" agentWhatsapp={null} />)

    expect(screen.queryByRole("link", { name: "Écrire sur WhatsApp" })).not.toBeInTheDocument()
  })

  it("renders nothing when no phone is available", () => {
    const { container } = renderWithIntl(<ContactSection />)

    expect(container).toBeEmptyDOMElement()
  })
})
