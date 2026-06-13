import { notFound } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { CheckCircle2, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ListingCard } from "@/components/listings/ListingCard"
import { PhotoGallery } from "@/components/listings/PhotoGallery"
import { ContactSection } from "@/components/shared/ContactSection"
import { PriceDisplay } from "@/components/shared/PriceDisplay"
import { ApiError } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { EMPTY_LISTINGS, getListingBySlug, getListings } from "@/lib/listings"

export const revalidate = 60

interface ListingDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { slug } = await params

  const listing = await getListingBySlug(slug).catch((error) => {
    if (error instanceof ApiError && error.status === 404) {
      notFound()
    }
    throw error
  })

  const related = await getListings({
    cityId: listing.cityId,
    neighborhoodId: listing.neighborhoodId,
    limit: 4,
  }).catch(() => EMPTY_LISTINGS)
  const relatedListings = related.data.filter((item) => item.id !== listing.id).slice(0, 3)

  const location = [listing.neighborhoodName, listing.cityName].filter(Boolean).join(", ")

  const [t, tListingType, tPropertyType, locale] = await Promise.all([
    getTranslations("ListingDetail"),
    getTranslations("ListingType"),
    getTranslations("PropertyType"),
    getLocale(),
  ])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8">
      <PhotoGallery images={listing.images} title={listing.title} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge>{tListingType(listing.listingType)}</Badge>
              <span className="text-sm text-muted-foreground">{listing.referenceId}</span>
            </div>
            <h1 className="text-2xl font-semibold">{listing.title}</h1>
            <p className="text-sm text-muted-foreground">
              {t("publishedOn", { date: formatDate(listing.createdAt, locale) })}
            </p>
          </div>

          <PriceDisplay
            price={listing.price}
            paymentPeriod={listing.paymentPeriod}
            className="text-2xl font-semibold"
          />

          <dl className="grid grid-cols-2 gap-4 rounded-xl border p-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">{t("propertyTypeLabel")}</dt>
              <dd className="font-medium">{tPropertyType(listing.propertyType)}</dd>
            </div>
            {listing.bedrooms !== null && (
              <div>
                <dt className="text-sm text-muted-foreground">{t("bedroomsLabel")}</dt>
                <dd className="font-medium">{listing.bedrooms}</dd>
              </div>
            )}
            {listing.bathrooms !== null && (
              <div>
                <dt className="text-sm text-muted-foreground">{t("bathroomsLabel")}</dt>
                <dd className="font-medium">{listing.bathrooms}</dd>
              </div>
            )}
            {listing.areaM2 !== null && (
              <div>
                <dt className="text-sm text-muted-foreground">{t("areaLabel")}</dt>
                <dd className="font-medium">{listing.areaM2} m²</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-muted-foreground">{t("cityLabel")}</dt>
              <dd className="font-medium">{listing.cityName}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("neighborhoodLabel")}</dt>
              <dd className="font-medium">{listing.neighborhoodName}</dd>
            </div>
          </dl>

          {listing.address && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {listing.address}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-base font-medium">{t("description")}</h2>
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {listing.description}
            </p>
          </div>

          {listing.amenities.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-medium">{t("amenities")}</h2>
              <ul className="flex flex-wrap gap-2">
                {listing.amenities.map((amenity) => (
                  <li
                    key={amenity.id}
                    className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm"
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

        <div className="lg:col-span-1">
          <ContactSection agentPhone={listing.agentPhone} agentWhatsapp={listing.agentWhatsapp} />
        </div>
      </div>

      {relatedListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">{t("similarListings")}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedListings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
