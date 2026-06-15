import { test, expect } from "@playwright/test"

import { ListingStatus, ListingType, PaymentPeriod, PropertyType, UserRole } from "@/types/enums"
import type { City } from "@/types/reference"
import type { Listing, ListingStatusLog } from "@/types/listing"

const AUTH_COOKIE_NAME = "token"

function makeToken(role: UserRole): string {
  const payload = Buffer.from(JSON.stringify({ role })).toString("base64url")
  return `header.${payload}.signature`
}

const CITIES: City[] = [
  {
    id: "city-1",
    name: "Douala",
    slug: "douala",
    neighborhoods: [{ id: "neigh-1", name: "Bonapriso" }],
  },
]

const AMENITIES = [{ id: "am-1", label: "Piscine", slug: "piscine" }]

function makeListing(overrides: Partial<Listing> = {}): Listing & { statusLog: ListingStatusLog[] } {
  return {
    id: "1",
    referenceId: "IMM-2026-00001",
    slug: "appartement-bonapriso",
    title: "Appartement Bonapriso",
    description: "Un bel appartement avec une vue magnifique sur la ville et la mer.",
    listingType: ListingType.RENT,
    propertyType: PropertyType.APARTMENT,
    status: ListingStatus.PENDING,
    price: 150000,
    paymentPeriod: PaymentPeriod.MONTHLY,
    bedrooms: 2,
    bathrooms: 1,
    areaM2: 60,
    address: null,
    agentPhone: "+237690123456",
    agentWhatsapp: null,
    rejectionReason: null,
    approvedAt: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    userId: "agent-1",
    cityId: "city-1",
    neighborhoodId: "neigh-1",
    cityName: "Douala",
    neighborhoodName: "Bonapriso",
    agentName: "Jean Dupont",
    images: [{ id: "img-1", url: "/file.svg", storageKey: "1", order: 0 }],
    amenities: [{ id: "am-1", label: "Piscine", slug: "piscine" }],
    statusLog: [
      { id: "log-1", status: ListingStatus.PENDING, reason: null, createdAt: "2026-01-01" },
    ],
    ...overrides,
  }
}

test.describe("Admin listing edit (Phase 1.4c)", () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
      {
        name: AUTH_COOKIE_NAME,
        value: makeToken(UserRole.ADMIN),
        domain: "localhost",
        path: "/",
      },
    ])

    await page.route("**/api/v1/cities**", async (route) => {
      await route.fulfill({ json: { data: CITIES, message: "ok" } })
    })

    await page.route("**/api/v1/amenities**", async (route) => {
      await route.fulfill({ json: { data: AMENITIES, message: "ok" } })
    })
  })

  test("edits a listing from the review panel and redirects back to the review page", async ({
    page,
  }) => {
    await page.route("**/api/v1/admin/listings/1", async (route) => {
      if (route.request().method() === "PATCH") {
        await route.fulfill({ json: { data: makeListing({}), message: "ok" } })
        return
      }
      await route.fulfill({ json: { data: makeListing({}), message: "ok" } })
    })

    await page.goto("/fr/admin/annonces/1")

    await expect(page.getByRole("link", { name: "Modifier" })).toBeVisible()
    await page.getByRole("link", { name: "Modifier" }).click()

    await expect(page).toHaveURL(/\/fr\/admin\/annonces\/1\/modifier/)
    await expect(page.getByRole("heading", { name: "Modifier l'annonce" })).toBeVisible()
    await expect(page.getByLabel("Titre de l'annonce")).toHaveValue("Appartement Bonapriso")
    await expect(page.getByText("Annonce déjà approuvée")).toHaveCount(0)

    await page.getByLabel("Titre de l'annonce").fill("Appartement Bonapriso rénové")
    await page.getByRole("button", { name: "Publier l'annonce" }).click()

    await expect(page).toHaveURL(/\/fr\/admin\/annonces\/1$/)
  })

  test("links to the edit page from the all-listings table", async ({ page }) => {
    await page.route("**/api/v1/admin/listings**", async (route) => {
      await route.fulfill({
        json: {
          data: { data: [makeListing({})], total: 1, page: 1, limit: 50, totalPages: 1 },
          message: "ok",
        },
      })
    })

    await page.goto("/fr/admin/annonces")

    await expect(page.getByRole("cell", { name: "IMM-2026-00001", exact: true })).toBeVisible()
    await expect(
      page.getByRole("link", { name: "Modifier", exact: true }).first()
    ).toHaveAttribute("href", "/fr/admin/annonces/1/modifier")
  })
})
