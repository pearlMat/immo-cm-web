import { describe, expect, it } from "vitest"

import { makeListingSchema, type PhotoItem } from "./listing.schema"
import { ListingType, PaymentPeriod, PropertyType } from "@/types/enums"

const t = (key: string) => key

const validPhoto: PhotoItem = { id: "1", url: "https://example.com/photo.jpg" }

const validListing = {
  title: "Bel appartement",
  listingType: ListingType.SALE,
  propertyType: PropertyType.APARTMENT,
  cityId: "city-1",
  neighborhoodId: "neigh-1",
  address: "",
  price: "150000",
  bedrooms: "",
  bathrooms: "",
  areaM2: "",
  description: "A".repeat(50),
  amenityIds: [],
  agentPhone: "+237 690 123 456",
  agentWhatsapp: "",
  photos: [validPhoto],
}

describe("makeListingSchema", () => {
  const schema = makeListingSchema(t)

  it("accepts a valid SALE listing and coerces numeric fields", () => {
    const result = schema.safeParse(validListing)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.price).toBe(150000)
      expect(result.data.bedrooms).toBeUndefined()
      expect(result.data.agentPhone).toBe("+237690123456")
    }
  })

  it("rejects a title shorter than 5 characters", () => {
    const result = schema.safeParse({ ...validListing, title: "Abc" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "title")).toBe(true)
    }
  })

  it("rejects a description shorter than 50 characters", () => {
    const result = schema.safeParse({ ...validListing, description: "Too short" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "description")).toBe(true)
    }
  })

  it("rejects a non-positive price", () => {
    const result = schema.safeParse({ ...validListing, price: "0" })

    expect(result.success).toBe(false)
  })

  it("rejects a non-positive optional area", () => {
    const result = schema.safeParse({ ...validListing, areaM2: "-10" })

    expect(result.success).toBe(false)
  })

  it("requires a payment period when listingType is RENT", () => {
    const result = schema.safeParse({ ...validListing, listingType: ListingType.RENT })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "paymentPeriod")).toBe(true)
    }
  })

  it("accepts a RENT listing with a payment period", () => {
    const result = schema.safeParse({
      ...validListing,
      listingType: ListingType.RENT,
      paymentPeriod: PaymentPeriod.MONTHLY,
    })

    expect(result.success).toBe(true)
  })

  it("requires at least one photo", () => {
    const result = schema.safeParse({ ...validListing, photos: [] })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "photos")).toBe(true)
    }
  })

  it("rejects more than 10 photos", () => {
    const photos = Array.from({ length: 11 }, (_, i) => ({
      id: String(i),
      url: "https://example.com/photo.jpg",
    }))
    const result = schema.safeParse({ ...validListing, photos })

    expect(result.success).toBe(false)
  })

  it("rejects a photo file with an invalid type", () => {
    const file = new File(["data"], "photo.gif", { type: "image/gif" })
    const result = schema.safeParse({ ...validListing, photos: [{ id: "1", file }] })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "photos")).toBe(true)
    }
  })

  it("rejects a photo file larger than 5MB", () => {
    const bigContent = new Uint8Array(5 * 1024 * 1024 + 1)
    const file = new File([bigContent], "photo.jpg", { type: "image/jpeg" })
    const result = schema.safeParse({ ...validListing, photos: [{ id: "1", file }] })

    expect(result.success).toBe(false)
  })
})
