import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { BedDouble, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PriceDisplay } from "@/components/shared/PriceDisplay"
import { Link } from "@/i18n/navigation"
import { formatDate } from "@/lib/utils"
import { listingHref } from "@/lib/slug"
import type { Listing } from "@/types/listing"

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  const t = useTranslations("ListingCard")
  const tListingType = useTranslations("ListingType")
  const tPropertyType = useTranslations("PropertyType")
  const locale = useLocale()
  const cover = listing.images[0]
  const location = [listing.neighborhoodName, listing.cityName].filter(Boolean).join(", ")

  return (
    <Link href={listingHref(listing)} className="block">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-4/3 w-full bg-muted">
          {cover ? (
            <Image
              src={cover.url}
              alt={listing.title}
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : null}
          <div className="absolute top-2 left-2 flex gap-1.5">
            <Badge>{tListingType(listing.listingType)}</Badge>
            <Badge variant="secondary">{tPropertyType(listing.propertyType)}</Badge>
          </div>
        </div>
        <CardContent className="flex flex-col gap-1.5">
          <PriceDisplay
            price={listing.price}
            paymentPeriod={listing.paymentPeriod}
            className="text-base font-semibold"
          />
          <h3 className="line-clamp-1 font-medium">{listing.title}</h3>
          {location && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {location}
            </p>
          )}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            {listing.bedrooms !== null && (
              <span className="flex items-center gap-1">
                <BedDouble className="size-3.5" />
                {t("bedrooms", { count: listing.bedrooms })}
              </span>
            )}
            <span>{formatDate(listing.createdAt, locale)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
