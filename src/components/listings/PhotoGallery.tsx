"use client"

import { useCallback, useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ListingImage } from "@/types/listing"

interface PhotoGalleryProps {
  images: ListingImage[]
  title: string
}

export function PhotoGallery({ images, title }: PhotoGalleryProps) {
  const t = useTranslations("PhotoGallery")
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  if (emblaApi) {
    emblaApi.off("select", onSelect)
    emblaApi.on("select", onSelect)
  }

  if (images.length === 0) {
    return <div className="aspect-16/9 w-full rounded-xl bg-muted" />
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden rounded-xl">
          <div className="flex">
            {images.map((image, index) => (
              <div key={image.id} className="relative aspect-16/9 min-w-0 flex-[0_0_100%]">
                <Image
                  src={image.url}
                  alt={`${title} — photo ${index + 1}`}
                  fill
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  priority={index === 0}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {images.length > 1 && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute top-1/2 left-2 -translate-y-1/2"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label={t("previousPhoto")}
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute top-1/2 right-2 -translate-y-1/2"
              onClick={() => emblaApi?.scrollNext()}
              aria-label={t("nextPhoto")}
            >
              <ChevronRight />
            </Button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={t("goToPhoto", { index: index + 1 })}
              className={cn(
                "relative aspect-4/3 w-20 shrink-0 overflow-hidden rounded-md ring-2 ring-transparent",
                selectedIndex === index && "ring-primary"
              )}
            >
              <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
