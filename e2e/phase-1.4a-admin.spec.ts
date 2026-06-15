import { test, expect } from "@playwright/test"

import { ListingStatus, ListingType, PaymentPeriod, PropertyType, UserRole } from "@/types/enums"
import type { Listing } from "@/types/listing"

const AUTH_COOKIE_NAME = "token"

function makeToken(role: UserRole): string {
  const payload = Buffer.from(JSON.stringify({ role })).toString("base64url")
  return `header.${payload}.signature`
}

function makeListing(overrides: Partial<Listing>): Listing {
  return {
    id: "1",
    referenceId: "IMM-2026-00001",
    slug: "appartement-bonapriso",
    title: "Appartement Bonapriso",
    description: "Un bel appartement.",
    listingType: ListingType.RENT,
    propertyType: PropertyType.APARTMENT,
    status: ListingStatus.PENDING,
    price: 150000,
    paymentPeriod: PaymentPeriod.MONTHLY,
    bedrooms: 2,
    bathrooms: 1,
    areaM2: 60,
    address: null,
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
    images: [],
    amenities: [],
    ...overrides,
  }
}

test.describe("Admin dashboard (Phase 1.4a)", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: AUTH_COOKIE_NAME,
        value: makeToken(UserRole.ADMIN),
        domain: "localhost",
        path: "/",
      },
    ])
  })

  test("dashboard shows stat cards and sidebar navigation", async ({ page }) => {
    // Dashboard stats are fetched server-side, so they can't be mocked via
    // page.route(); without a backend the page falls back to zero counts
    // ("degraded but functional"). This test only verifies layout/navigation.
    await page.goto("/fr/admin/tableau-de-bord")

    await expect(page.getByRole("heading", { name: "Tableau de bord" })).toBeVisible()
    await expect(page.getByText("Annonces en attente").first()).toBeVisible()
    await expect(page.getByText("Annonces approuvées")).toBeVisible()

    await expect(page.getByRole("link", { name: "Toutes les annonces" }).first()).toBeVisible()
    await expect(page.getByRole("link", { name: "Utilisateurs" }).first()).toBeVisible()
  })

  test("approves a pending listing from the review queue", async ({ page }) => {
    let approved = false

    await page.route("**/api/v1/admin/listings**", async (route) => {
      const listings = approved ? [] : [makeListing({})]
      await route.fulfill({
        json: {
          data: { data: listings, total: listings.length, page: 1, limit: 50, totalPages: 1 },
          message: "ok",
        },
      })
    })

    await page.route("**/api/v1/admin/listings/1/approve", async (route) => {
      approved = true
      await route.fulfill({ json: { data: null, message: "ok" } })
    })

    await page.goto("/fr/admin/annonces/en-attente")

    await expect(page.getByRole("cell", { name: "IMM-2026-00001" })).toBeVisible()

    await page.getByRole("button", { name: "Approuver" }).click()
    await page.getByRole("button", { name: "Confirmer" }).click()

    await expect(page.getByText("Annonce approuvée.")).toBeVisible()
    await expect(page.getByText("Aucune annonce en attente.")).toBeVisible()
  })

  test("rejects a listing with a reason from the review queue", async ({ page }) => {
    let rejectedReason: string | undefined

    await page.route("**/api/v1/admin/listings**", async (route) => {
      const listings = rejectedReason ? [] : [makeListing({})]
      await route.fulfill({
        json: {
          data: { data: listings, total: listings.length, page: 1, limit: 50, totalPages: 1 },
          message: "ok",
        },
      })
    })

    await page.route("**/api/v1/admin/listings/1/reject", async (route) => {
      rejectedReason = route.request().postDataJSON().reason
      await route.fulfill({ json: { data: null, message: "ok" } })
    })

    await page.goto("/fr/admin/annonces/en-attente")

    await expect(page.getByRole("cell", { name: "IMM-2026-00001" })).toBeVisible()

    await page.getByRole("button", { name: "Rejeter" }).click()
    await page
      .getByPlaceholder("Expliquez pourquoi cette annonce est rejetée...")
      .fill("Photos de mauvaise qualité")
    await page.getByRole("button", { name: "Confirmer" }).click()

    await expect(page.getByText("Annonce rejetée.")).toBeVisible()
    await expect(page.getByText("Aucune annonce en attente.")).toBeVisible()
  })
})
