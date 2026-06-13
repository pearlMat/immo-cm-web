import { describe, expect, it } from "vitest"

import { renderWithIntl } from "@/test/i18n"
import { ListingStatus } from "@/types/enums"

import { StatusBadge } from "./StatusBadge"

describe("StatusBadge", () => {
  it.each([
    [ListingStatus.PENDING, "En attente"],
    [ListingStatus.APPROVED, "Approuvée"],
    [ListingStatus.REJECTED, "Rejetée"],
    [ListingStatus.PENDING_PAYMENT, "Paiement requis"],
  ])("renders the correct label for %s", (status, label) => {
    const { getByText } = renderWithIntl(<StatusBadge status={status} />)

    expect(getByText(label)).toBeInTheDocument()
  })
})
