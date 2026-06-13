import type { Listing } from "@/types/listing"

/** Builds the public URL path for a listing's detail page. */
export function listingHref(listing: Pick<Listing, "slug">): string {
  return `/annonces/${listing.slug}`
}
