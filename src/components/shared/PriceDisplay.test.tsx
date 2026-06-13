import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithIntl } from "@/test/i18n"
import { PaymentPeriod } from "@/types/enums"

import { PriceDisplay } from "./PriceDisplay"

describe("PriceDisplay", () => {
  it("renders the formatted price without a period when none is given", () => {
    renderWithIntl(<PriceDisplay price={150000} />)

    expect(screen.getByText("150 000 FCFA")).toBeInTheDocument()
  })

  it("appends the monthly period label", () => {
    renderWithIntl(<PriceDisplay price={150000} paymentPeriod={PaymentPeriod.MONTHLY} />)

    expect(screen.getByText(/150 000 FCFA/)).toBeInTheDocument()
    expect(screen.getByText(/Mensuel/)).toBeInTheDocument()
  })

  it("wraps the negotiable label in parentheses", () => {
    renderWithIntl(<PriceDisplay price={150000} paymentPeriod={PaymentPeriod.NEGOTIABLE} />)

    expect(screen.getByText(/\(Négociable\)/)).toBeInTheDocument()
  })
})
