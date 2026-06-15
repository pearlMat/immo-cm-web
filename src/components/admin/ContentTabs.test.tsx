import { describe, expect, it } from "vitest"

import { renderWithIntl } from "@/test/i18n"

import { ContentTabs } from "./ContentTabs"

describe("ContentTabs", () => {
  it("renders links to the content management sections", () => {
    const { getByRole } = renderWithIntl(<ContentTabs />)

    expect(getByRole("link", { name: "Quartiers" })).toHaveAttribute(
      "href",
      "/fr/admin/contenu/quartiers"
    )
    expect(getByRole("link", { name: "Équipements" })).toHaveAttribute(
      "href",
      "/fr/admin/contenu/equipements"
    )
  })
})
