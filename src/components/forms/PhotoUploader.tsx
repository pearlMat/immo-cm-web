"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { PhotoItem } from "@/schemas/listing.schema"

const MAX_PHOTOS = 10
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png"]

interface PhotoUploaderProps {
  value: PhotoItem[]
  onChange: (items: PhotoItem[]) => void
  error?: string
}

function photoUrl(photo: PhotoItem): string {
  if (photo.url) return photo.url
  return URL.createObjectURL(photo.file!)
}

export function PhotoUploader({ value, onChange, error }: PhotoUploaderProps) {
  const t = useTranslations("ListingForm")
  const inputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  function addFiles(files: FileList | File[]) {
    setLocalError(null)
    const incoming = Array.from(files)

    if (value.length + incoming.length > MAX_PHOTOS) {
      setLocalError(t("photos.tooMany"))
      return
    }

    for (const file of incoming) {
      if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
        setLocalError(t("photos.invalidType"))
        return
      }
      if (file.size > MAX_PHOTO_SIZE_BYTES) {
        setLocalError(t("photos.tooLarge"))
        return
      }
    }

    const newItems: PhotoItem[] = incoming.map((file) => ({
      id: crypto.randomUUID(),
      file,
    }))

    onChange([...value, ...newItems])
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  function handleRemove(id: string) {
    onChange(value.filter((item) => item.id !== id))
  }

  function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= value.length) return

    const next = [...value]
    const [moved] = next.splice(index, 1)
    next.splice(targetIndex, 0, moved)
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
        }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input px-4 py-8 text-center text-sm text-muted-foreground transition-colors hover:bg-muted"
      >
        <ImagePlus className="size-6" />
        <span>{t("photos.dropzone")}</span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            e.target.value = ""
          }}
        />
      </div>

      {(localError ?? error) && (
        <p className="text-sm text-destructive">{localError ?? error}</p>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((photo, index) => (
            <div
              key={photo.id}
              className="relative aspect-square overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10"
            >
              <Image
                src={photoUrl(photo)}
                alt={t("photos.altPhoto", { number: index + 1 })}
                fill
                sizes="200px"
                className="object-cover"
                unoptimized={!photo.url}
              />
              {index === 0 && (
                <span className="absolute left-1 top-1 rounded bg-foreground/80 px-1.5 py-0.5 text-xs font-medium text-background">
                  {t("photos.cover")}
                </span>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                className="absolute right-1 top-1"
                aria-label={t("photos.remove")}
                onClick={() => handleRemove(photo.id)}
              >
                <X className="size-3.5" />
              </Button>
              <div className="absolute inset-x-1 bottom-1 flex justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  aria-label={t("photos.moveLeft")}
                  disabled={index === 0}
                  onClick={() => handleMove(index, -1)}
                >
                  <ChevronLeft className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  aria-label={t("photos.moveRight")}
                  disabled={index === value.length - 1}
                  onClick={() => handleMove(index, 1)}
                >
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
