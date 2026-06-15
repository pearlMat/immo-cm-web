import type { ListingType, PropertyType, ListingStatus } from "./enums"

export interface ListingFilters {
  cityId?: string
  neighborhoodId?: string
  listingType?: ListingType
  propertyType?: PropertyType
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  search?: string
  sort?: "price_asc" | "price_desc" | "oldest" // default: newest
  page?: number
  limit?: number
}

export interface AgentListingFilters {
  status?: ListingStatus
  page?: number
  limit?: number
}

export interface AdminListingFilters {
  status?: ListingStatus
  cityId?: string
  listingType?: ListingType
  propertyType?: PropertyType
  agentName?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  sort?: "newest" | "oldest"
  page?: number
  limit?: number
}
