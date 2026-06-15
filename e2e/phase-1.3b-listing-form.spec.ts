import { test, expect } from "@playwright/test"

import { ListingStatus, ListingType, PaymentPeriod, PropertyType, UserRole } from "@/types/enums"
import type { City } from "@/types/reference"
import type { Listing } from "@/types/listing"

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

function makeListing(overrides: Partial<Listing>): Listing {
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
    images: [{ id: "img-1", url: "/file.svg", storageKey: "1", order: 0 }],
    amenities: [{ id: "am-1", label: "Piscine", slug: "piscine" }],
    ...overrides,
  }
}

test.describe("Listing form (Phase 1.3b)", () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
      {
        name: AUTH_COOKIE_NAME,
        value: makeToken(UserRole.AGENT),
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

  test("creates a new listing and redirects to Mes annonces", async ({ page }) => {
    await page.route("**/api/v1/agent/listings", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({ json: { data: makeListing({}), message: "ok" } })
        return
      }
      await route.continue()
    })

    await page.goto("/fr/agent/annonces/nouvelle")

    await expect(page.getByRole("heading", { name: "Nouvelle annonce" })).toBeVisible()

    await page.getByLabel("Titre de l'annonce").fill("Bel appartement à vendre à Bonapriso")
    await page.getByRole("button", { name: "À vendre" }).click()

    await page.getByRole("combobox", { name: "Ville" }).click()
    await page.getByRole("option", { name: "Douala" }).click()

    await page.getByRole("combobox", { name: "Quartier" }).click()
    await page.getByRole("option", { name: "Bonapriso" }).click()

    await page.getByLabel("Prix (FCFA)").fill("150000")

    await page
      .getByLabel("Description")
      .fill("Un bel appartement avec une vue magnifique sur la ville et la mer.")

    await page.getByLabel("Téléphone de contact").fill("+237690123456")

    await page.locator('input[type="file"]').setInputFiles({
      name: "photo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
    })

    await expect(page.getByText("Photo de couverture")).toBeVisible()

    await page.getByRole("button", { name: "Publier l'annonce" }).click()

    await expect(page).toHaveURL(/\/fr\/agent\/mes-annonces/)
  })

  test("pre-fills the form when editing a pending listing", async ({ page }) => {
    await page.route("**/api/v1/agent/listings/1", async (route) => {
      await route.fulfill({
        json: { data: makeListing({ status: ListingStatus.PENDING }), message: "ok" },
      })
    })

    await page.goto("/fr/agent/annonces/1/modifier")

    await expect(page.getByRole("heading", { name: "Modifier l'annonce" })).toBeVisible()
    await expect(page.getByLabel("Titre de l'annonce")).toHaveValue("Appartement Bonapriso")
    await expect(page.getByLabel("Prix (FCFA)")).toHaveValue("150000")
    await expect(page.getByText("Annonce déjà approuvée")).toHaveCount(0)
  })

  test("shows a warning banner when editing an approved listing", async ({ page }) => {
    await page.route("**/api/v1/agent/listings/1", async (route) => {
      await route.fulfill({
        json: { data: makeListing({ status: ListingStatus.APPROVED }), message: "ok" },
      })
    })

    await page.goto("/fr/agent/annonces/1/modifier")

    await expect(page.getByText("Annonce déjà approuvée")).toBeVisible()
  })
})
