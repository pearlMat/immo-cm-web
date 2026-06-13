import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { api, ApiError } from "./api"

function mockFetchOnce(body: unknown, init: { ok: boolean; status?: number } = { ok: true }) {
  const response = {
    ok: init.ok,
    status: init.status ?? (init.ok ? 200 : 400),
    statusText: "Error",
    json: () => Promise.resolve(body),
  } as Response

  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response))

  return response
}

describe("api", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("GET sends credentials and returns the unwrapped data", async () => {
    mockFetchOnce({ data: { id: "1" }, message: "ok" })

    const result = await api.get<{ id: string }>("/listings")

    expect(result).toEqual({ id: "1" })
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/listings",
      expect.objectContaining({ method: "GET", credentials: "include" })
    )
  })

  it("GET appends query params, skipping undefined values", async () => {
    mockFetchOnce({ data: [], message: "ok" })

    await api.get("/listings", { params: { cityId: "douala", page: 2, search: undefined } })

    const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(url).toBe("http://localhost:3000/api/v1/listings?cityId=douala&page=2")
  })

  it("POST sends a JSON body with Content-Type header", async () => {
    mockFetchOnce({ data: { id: "1" }, message: "created" })

    await api.post("/agent/listings", { title: "Bel appartement" })

    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(init.method).toBe("POST")
    expect(init.headers["Content-Type"]).toBe("application/json")
    expect(init.body).toBe(JSON.stringify({ title: "Bel appartement" }))
  })

  it("POST with FormData omits the Content-Type header and sends the FormData as-is", async () => {
    mockFetchOnce({ data: { id: "1" }, message: "created" })

    const form = new FormData()
    form.append("title", "Bel appartement")

    await api.post("/agent/listings", form)

    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(init.headers["Content-Type"]).toBeUndefined()
    expect(init.body).toBe(form)
  })

  it("throws ApiError with the response message and status on non-2xx", async () => {
    mockFetchOnce({ data: null, message: "Non trouvé" }, { ok: false, status: 404 })

    await expect(api.get("/listings/missing")).rejects.toMatchObject(
      new ApiError("Non trouvé", 404)
    )
  })
})
