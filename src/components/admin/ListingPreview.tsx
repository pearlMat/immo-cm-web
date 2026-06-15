import { useLocale, useTranslations } from "next-intl"
import { CheckCircle2, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { PhotoGallery } from "@/components/listings/PhotoGallery"
import { PriceDisplay } from "@/components/shared/PriceDisplay"
import { formatDate } from "@/lib/utils"
import type { Listing } from "@/types/listing"

interface ListingPreviewProps {
  listing: Listing
}

/** Renders a listing approximately as it appears on its public detail page, for admin review. */
export function ListingPreview({ listing }: ListingPreviewProps) {
  const t = useTranslations("ListingDetail")
  const tListingType = useTranslations("ListingType")
  const tPropertyType = useTranslations("PropertyType")
  const tReview = useTranslations("ListingReviewPage")
  const locale = useLocale()

  const location = [listing.neighborhoodName, listing.cityName].filter(Boolean).join(", ")

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 overflow-hidden rounded-2xl border-4 border-foreground/10 bg-background p-3 shadow-sm">
      {listing.images.length > 0 ? (
        <PhotoGallery images={listing.images} title={listing.title} />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
          {tReview("noPhotos")}
        </div>
      )}

      <div className="flex flex-col gap-2 px-1">
        <div className="flex items-center gap-2">
          <Badge>{tListingType(listing.listingType)}</Badge>
          <span className="text-sm text-muted-foreground">{listing.referenceId}</span>
        </div>
        <h2 className="text-xl font-semibold">{listing.title}</h2>
        <p className="text-sm text-muted-foreground">
          {t("publishedOn", { date: formatDate(listing.createdAt, locale) })}
        </p>

        <PriceDisplay
          price={listing.price}
          paymentPeriod={listing.paymentPeriod}
          className="text-xl font-semibold"
        />

        <dl className="grid grid-cols-2 gap-3 rounded-xl border p-3 text-sm">
          <div>
            <dt className="text-muted-foreground">{t("propertyTypeLabel")}</dt>
            <dd className="font-medium">{tPropertyType(listing.propertyType)}</dd>
          </div>
          {listing.bedrooms !== null && (
            <div>
              <dt className="text-muted-foreground">{t("bedroomsLabel")}</dt>
              <dd className="font-medium">{listing.bedrooms}</dd>
            </div>
          )}
          {listing.bathrooms !== null && (
            <div>
              <dt className="text-muted-foreground">{t("bathroomsLabel")}</dt>
              <dd className="font-medium">{listing.bathrooms}</dd>
            </div>
          )}
          {listing.areaM2 !== null && (
            <div>
              <dt className="text-muted-foreground">{t("areaLabel")}</dt>
              <dd className="font-medium">{listing.areaM2} m²</dd>
            </div>
          )}
        </dl>

        {listing.address && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {listing.address}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">{t("description")}</h3>
          <p className="whitespace-pre-line text-sm text-muted-foreground">{listing.description}</p>
        </div>

        {listing.amenities.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">{t("amenities")}</h3>
            <ul className="flex flex-wrap gap-2">
              {listing.amenities.map((amenity) => (
                <li
                  key={amenity.id}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
                >
                  <CheckCircle2 className="size-3.5 text-primary" />
                  {amenity.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {location && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {location}
          </p>
        )}
      </div>
    </div>
  )
}
