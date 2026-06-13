import type {
  ListingType,
  PropertyType,
  ListingStatus,
  PaymentPeriod,
} from "./enums"

export interface ListingImage {
  id: string
  url: string
  storageKey: string
  order: number
}

export interface ListingAmenity {
  id: string
  label: string
  slug: string
}

export interface Listing {
  id: string
  referenceId: string // format: "IMM-YYYY-NNNNN"
  slug: string
  title: string
  description: string
  listingType: ListingType
  propertyType: PropertyType
  status: ListingStatus
  price: number // integer, FCFA
  paymentPeriod: PaymentPeriod | null
  bedrooms: number | null
  bathrooms: number | null
  areaM2: number | null
  address: string | null
  agentPhone?: string // only present when contact is revealed / free phase
  agentWhatsapp?: string | null // only present when contact is revealed / free phase
  rejectionReason: string | null
  approvedAt: string | null
  createdAt: string
  updatedAt: string
  userId: string
  cityId: string
  neighborhoodId: string
  cityName?: string
  neighborhoodName?: string
  images: ListingImage[]
  amenities: ListingAmenity[]
}

export interface PaginatedListings {
  data: Listing[]
  total: number
  page: number
  limit: number
  totalPages: number
}
