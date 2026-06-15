import { useState } from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it } from "vitest"

import { renderWithIntl } from "@/test/i18n"
import type { PhotoItem } from "@/schemas/listing.schema"

import { PhotoUploader } from "./PhotoUploader"

function Wrapper({ initial }: { initial: PhotoItem[] }) {
  const [value, setValue] = useState<PhotoItem[]>(initial)
  return <PhotoUploader value={value} onChange={setValue} />
}

function makeFile(name: string, type: string, size: number): File {
  const file = new File([new Uint8Array(size)], name, { type })
  return file
}

beforeAll(() => {
  if (!URL.createObjectURL) {
    URL.createObjectURL = () => "blob:mock"
  }
})

describe("PhotoUploader", () => {
  it("adds a valid uploaded file to the preview grid", async () => {
    const user = userEvent.setup()
    const { container } = renderWithIntl(<Wrapper initial={[]} />)

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = makeFile("photo.jpg", "image/jpeg", 1024)

    await user.upload(input, file)

    expect(await screen.findAllByRole("img")).toHaveLength(1)
    expect(screen.getByText("Photo de couverture")).toBeInTheDocument()
  })

  it("rejects a file with an invalid type", async () => {
    const user = userEvent.setup({ applyAccept: false })
    const { container } = renderWithIntl(<Wrapper initial={[]} />)

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = makeFile("photo.gif", "image/gif", 1024)

    await user.upload(input, file)

    expect(
      await screen.findByText("Seules les images JPEG et PNG sont acceptées")
    ).toBeInTheDocument()
    expect(screen.queryAllByRole("img")).toHaveLength(0)
  })

  it("rejects a file larger than 5MB", async () => {
    const user = userEvent.setup()
    const { container } = renderWithIntl(<Wrapper initial={[]} />)

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = makeFile("photo.jpg", "image/jpeg", 5 * 1024 * 1024 + 1)

    await user.upload(input, file)

    expect(await screen.findByText("Chaque photo doit faire moins de 5 Mo")).toBeInTheDocument()
  })

  it("rejects adding more than 10 photos", async () => {
    const user = userEvent.setup()
    const initial: PhotoItem[] = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      url: `https://example.com/${i}.jpg`,
    }))
    const { container } = renderWithIntl(<Wrapper initial={initial} />)

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = makeFile("photo.jpg", "image/jpeg", 1024)

    await user.upload(input, file)

    expect(
      await screen.findByText("Vous pouvez ajouter au maximum 10 photos")
    ).toBeInTheDocument()
  })

  it("removes a photo when the remove button is clicked", async () => {
    const user = userEvent.setup()
    const initial: PhotoItem[] = [{ id: "1", url: "https://example.com/1.jpg" }]
    renderWithIntl(<Wrapper initial={initial} />)

    expect(screen.getAllByRole("img")).toHaveLength(1)

    await user.click(screen.getByRole("button", { name: "Supprimer la photo" }))

    expect(screen.queryAllByRole("img")).toHaveLength(0)
  })

  it("reorders photos with the move-left and move-right buttons", async () => {
    const user = userEvent.setup()
    const initial: PhotoItem[] = [
      { id: "1", url: "https://example.com/1.jpg" },
      { id: "2", url: "https://example.com/2.jpg" },
    ]
    renderWithIntl(<Wrapper initial={initial} />)

    const moveRightButtons = screen.getAllByRole("button", { name: "Déplacer vers la droite" })
    await user.click(moveRightButtons[0])

    const images = screen.getAllByRole("img")
    expect(images[0]).toHaveAttribute("src", expect.stringContaining("2.jpg"))
    expect(screen.getByText("Photo de couverture")).toBeInTheDocument()
  })
})
