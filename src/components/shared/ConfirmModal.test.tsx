import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { renderWithIntl } from "@/test/i18n"

import { ConfirmModal } from "./ConfirmModal"

describe("ConfirmModal", () => {
  it("renders title and description when open", () => {
    renderWithIntl(
      <ConfirmModal
        open
        onOpenChange={vi.fn()}
        title="Supprimer cette annonce ?"
        description="Cette action est irréversible."
        onConfirm={vi.fn()}
      />
    )

    expect(screen.getByText("Supprimer cette annonce ?")).toBeInTheDocument()
    expect(screen.getByText("Cette action est irréversible.")).toBeInTheDocument()
  })

  it("calls onConfirm when the confirm button is clicked", async () => {
    const onConfirm = vi.fn()
    renderWithIntl(
      <ConfirmModal
        open
        onOpenChange={vi.fn()}
        title="Title"
        description="Description"
        onConfirm={onConfirm}
      />
    )

    await userEvent.click(screen.getByRole("button", { name: "Confirmer" }))

    expect(onConfirm).toHaveBeenCalled()
  })

  it("calls onOpenChange(false) when the cancel button is clicked", async () => {
    const onOpenChange = vi.fn()
    renderWithIntl(
      <ConfirmModal
        open
        onOpenChange={onOpenChange}
        title="Title"
        description="Description"
        onConfirm={vi.fn()}
      />
    )

    await userEvent.click(screen.getByRole("button", { name: "Annuler" }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("does not render content when closed", () => {
    renderWithIntl(
      <ConfirmModal
        open={false}
        onOpenChange={vi.fn()}
        title="Hidden title"
        description="Hidden description"
        onConfirm={vi.fn()}
      />
    )

    expect(screen.queryByText("Hidden title")).not.toBeInTheDocument()
  })
})
