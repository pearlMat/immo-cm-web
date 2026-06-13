import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getCities, getListingBySlug, getListings } from "./listings"

function mockFetchOnce(body: unknown) {
  const response = {
    ok: true,
    status: 200,
    statusText: "OK",
    json: () => Promise.resolve(body),
  } as Response

  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response))
}

describe("listings", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("getListings sends filters as query params", async () => {
    mockFetchOnce({ data: { data: [], total: 0, page: 1, limit: 20, totalPages: 0 }, message: "ok" })

    await getListings({ cityId: "douala", listingType: "RENT", page: 2 })

    const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(url).toBe(
      "http://localhost:3000/api/v1/listings?cityId=douala&listingType=RENT&page=2"
    )
  })

  it("getListings passes a revalidate option through to fetch", async () => {
    mockFetchOnce({ data: { data: [], total: 0, page: 1, limit: 20, totalPages: 0 }, message: "ok" })

    await getListings({ limit: 6 }, { revalidate: 300 })

    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(init.next).toEqual({ revalidate: 300 })
  })

  it("getListingBySlug fetches the listing with a 60s revalidate", async () => {
    mockFetchOnce({ data: { id: "1", slug: "bel-appartement" }, message: "ok" })

    const result = await getListingBySlug("bel-appartement")

    expect(result).toEqual({ id: "1", slug: "bel-appartement" })
    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toBe("http://localhost:3000/api/v1/listings/bel-appartement")
    expect(init.next).toEqual({ revalidate: 60 })
  })

  it("getCities fetches the city list", async () => {
    mockFetchOnce({ data: [{ id: "1", name: "Douala", slug: "douala", neighborhoods: [] }], message: "ok" })

    const result = await getCities()

    expect(result).toEqual([{ id: "1", name: "Douala", slug: "douala", neighborhoods: [] }])
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/cities",
      expect.objectContaining({ next: { revalidate: 3600 } })
    )
  })
})
