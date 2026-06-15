import { describe, expect, it } from "vitest"

import { renderWithIntl } from "@/test/i18n"
import { UserStatus } from "@/types/enums"

import { UserStatusBadge } from "./UserStatusBadge"

describe("UserStatusBadge", () => {
  it.each([
    [UserStatus.ACTIVE, "Actif"],
    [UserStatus.SUSPENDED, "Suspendu"],
    [UserStatus.BANNED, "Banni"],
  ])("renders the correct label for %s", (status, label) => {
    const { getByText } = renderWithIntl(<UserStatusBadge status={status} />)

    expect(getByText(label)).toBeInTheDocument()
  })
})
