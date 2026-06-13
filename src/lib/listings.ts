import { api } from "@/lib/api"
import { ListingType, PropertyType } from "@/types/enums"
import type { ListingFilters } from "@/types/filters"
import type { Listing, PaginatedListings } from "@/types/listing"
import type { City } from "@/types/reference"

const SORT_VALUES = ["price_asc", "price_desc", "oldest"] as const

export type SearchParams = Record<string, string | string[] | undefined>

/** Parses Next.js searchParams into typed ListingFilters, ignoring unknown/invalid values. */
export function parseListingFilters(searchParams: SearchParams): ListingFilters {
  const get = (key: string) => {
    const value = searchParams[key]
    return Array.isArray(value) ? value[0] : value
  }

  const filters: ListingFilters = { limit: 20 }

  const cityId = get("cityId")
  if (cityId) filters.cityId = cityId

  const neighborhoodId = get("neighborhoodId")
  if (neighborhoodId) filters.neighborhoodId = neighborhoodId

  const listingType = get("listingType")
  if (listingType && Object.values(ListingType).includes(listingType as ListingType)) {
    filters.listingType = listingType as ListingType
  }

  const propertyType = get("propertyType")
  if (propertyType && Object.values(PropertyType).includes(propertyType as PropertyType)) {
    filters.propertyType = propertyType as PropertyType
  }

  const minPrice = get("minPrice")
  if (minPrice && !Number.isNaN(Number(minPrice))) filters.minPrice = Number(minPrice)

  const maxPrice = get("maxPrice")
  if (maxPrice && !Number.isNaN(Number(maxPrice))) filters.maxPrice = Number(maxPrice)

  const bedrooms = get("bedrooms")
  if (bedrooms && !Number.isNaN(Number(bedrooms))) filters.bedrooms = Number(bedrooms)

  const search = get("q")
  if (search) filters.search = search

  const sort = get("sort")
  if (sort && (SORT_VALUES as readonly string[]).includes(sort)) {
    filters.sort = sort as ListingFilters["sort"]
  }

  const page = get("page")
  if (page && !Number.isNaN(Number(page))) filters.page = Number(page)

  return filters
}

/** Empty result set, used as a fallback when the listings API is unreachable. */
export const EMPTY_LISTINGS: PaginatedListings = {
  data: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
}

/** Fetches a paginated, filtered list of approved listings. */
export function getListings(
  filters: ListingFilters = {},
  options: { revalidate?: number } = {}
): Promise<PaginatedListings> {
  return api.get<PaginatedListings>("/listings", {
    params: {
      cityId: filters.cityId,
      neighborhoodId: filters.neighborhoodId,
      listingType: filters.listingType,
      propertyType: filters.propertyType,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      bedrooms: filters.bedrooms,
      search: filters.search,
      sort: filters.sort,
      page: filters.page,
      limit: filters.limit,
    },
    next: { revalidate: options.revalidate ?? 0 },
  })
}

/** Fetches a single approved listing by its slug, with ISR caching. */
export function getListingBySlug(slug: string): Promise<Listing> {
  return api.get<Listing>(`/listings/${slug}`, {
    next: { revalidate: 60 },
  })
}

/** Fetches the list of cities with their neighborhoods. */
export function getCities(): Promise<City[]> {
  return api.get<City[]>("/cities", {
    next: { revalidate: 3600 },
  })
}
