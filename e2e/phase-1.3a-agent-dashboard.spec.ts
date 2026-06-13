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
    images: [],
    amenities: [],
    ...overrides,
  }
}

const ALL_LISTINGS: Listing[] = [
  makeListing({ id: "1", status: ListingStatus.PENDING, title: "Appartement Bonapriso" }),
  makeListing({ id: "2", status: ListingStatus.APPROVED, title: "Villa Akwa" }),
  makeListing({ id: "3", status: ListingStatus.REJECTED, title: "Studio Bonanjo" }),
]

test.describe("Agent dashboard (Phase 1.3a)", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: AUTH_COOKIE_NAME,
        value: makeToken(UserRole.AGENT),
        domain: "localhost",
        path: "/",
      },
    ])
  })

  test("dashboard shows stat cards and sidebar navigation", async ({ page }) => {
    await page.goto("/fr/agent/tableau-de-bord")

    await expect(page.getByRole("heading", { name: "Tableau de bord" })).toBeVisible()
    await expect(page.getByText("Total annonces")).toBeVisible()
    await expect(page.getByText("Aucune activité récente.")).toBeVisible()

    await expect(page.getByRole("link", { name: "Mes annonces" }).first()).toBeVisible()
    await expect(page.getByRole("link", { name: "Profil" }).first()).toBeVisible()
  })

  test("Mes annonces filter tabs switch and show correct status badges", async ({ page }) => {
    await page.route("**/api/v1/agent/listings**", async (route) => {
      const url = new URL(route.request().url())
      const status = url.searchParams.get("status")
      const listings = ALL_LISTINGS.filter((listing) => !status || listing.status === status)

      await route.fulfill({
        json: {
          data: { data: listings, total: listings.length, page: 1, limit: 50, totalPages: 1 },
          message: "ok",
        },
      })
    })

    await page.goto("/fr/agent/mes-annonces")

    await expect(page.getByRole("cell", { name: "En attente" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Modifier" }).first()).toBeVisible()

    await page.getByRole("tab", { name: "Rejetées" }).click()

    await expect(page.getByRole("cell", { name: "Rejetée" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Soumettre à nouveau" })).toBeVisible()
  })

  test("profile page updates personal info and validates the password form", async ({ page }) => {
    await page.route("**/api/v1/auth/me", async (route) => {
      if (route.request().method() === "PATCH") {
        await route.fulfill({
          json: { data: route.request().postDataJSON(), message: "ok" },
        })
        return
      }
      await route.continue()
    })

    await page.goto("/fr/agent/profil")

    await expect(page.getByRole("heading", { name: "Profil" })).toBeVisible()

    await page.getByLabel("Nom complet").fill("Marie Curie")
    await page.getByLabel("Téléphone").fill("+237690123456")
    await page.getByRole("button", { name: "Enregistrer" }).first().click()

    await expect(page.getByText("Profil mis à jour.")).toBeVisible()

    await page.getByRole("button", { name: "Enregistrer" }).nth(1).click()

    await expect(page.getByText("Ce champ est requis").first()).toBeVisible()
  })
})
