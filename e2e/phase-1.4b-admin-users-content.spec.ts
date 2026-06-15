import { test, expect } from "@playwright/test"

import { UserAccountType, UserRole, UserStatus } from "@/types/enums"
import type { AdminUser } from "@/types/user"

const AUTH_COOKIE_NAME = "token"

function makeToken(role: UserRole): string {
  const payload = Buffer.from(JSON.stringify({ role })).toString("base64url")
  return `header.${payload}.signature`
}

function makeUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id: "1",
    email: "jean@example.com",
    emailVerified: true,
    fullName: "Jean Dupont",
    phone: "+237600000000",
    whatsapp: null,
    role: UserRole.AGENT,
    accountType: UserAccountType.AGENT,
    status: UserStatus.ACTIVE,
    profilePhoto: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    listingsCount: 3,
    ...overrides,
  }
}

test.describe("Admin users and content management (Phase 1.4b)", () => {
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

  test("lists users and suspends one", async ({ page }) => {
    let suspended = false

    await page.route("**/api/v1/admin/users**", async (route) => {
      const user = makeUser({ status: suspended ? UserStatus.SUSPENDED : UserStatus.ACTIVE })
      await route.fulfill({
        json: {
          data: { data: [user], total: 1, page: 1, limit: 20, totalPages: 1 },
          message: "ok",
        },
      })
    })

    await page.route("**/api/v1/admin/users/1/suspend", async (route) => {
      suspended = true
      await route.fulfill({ json: { data: null, message: "ok" } })
    })

    await page.goto("/fr/admin/utilisateurs")

    await expect(page.getByRole("cell", { name: "Jean Dupont" })).toBeVisible()

    await page.getByRole("button", { name: "Suspendre" }).click()
    await page.getByRole("button", { name: "Confirmer" }).click()

    await expect(page.getByText("Utilisateur suspendu.")).toBeVisible()
    await expect(page.getByRole("button", { name: "Réactiver" })).toBeVisible()
  })

  test("manages neighborhoods from the content section", async ({ page }) => {
    let neighborhoods = [{ id: "n-1", name: "Bonapriso" }]

    await page.route("**/api/v1/cities**", async (route) => {
      await route.fulfill({
        json: {
          data: [{ id: "city-1", slug: "douala", name: "Douala", neighborhoods }],
          message: "ok",
        },
      })
    })

    await page.route("**/api/v1/admin/cities/city-1/neighborhoods", async (route) => {
      neighborhoods = [...neighborhoods, { id: "n-2", name: "Akwa" }]
      await route.fulfill({ json: { data: { id: "n-2", name: "Akwa" }, message: "ok" } })
    })

    await page.goto("/fr/admin/contenu/quartiers")

    await expect(page.getByRole("heading", { name: "Quartiers" })).toBeVisible()
    await expect(page.getByText("Bonapriso")).toBeVisible()

    await page.getByPlaceholder("Nom du quartier").fill("Akwa")
    await page.getByRole("button", { name: "Ajouter" }).click()

    await expect(page.getByText("Quartier ajouté.")).toBeVisible()
    await expect(page.getByText("Akwa")).toBeVisible()
  })

  test("manages amenities from the content section", async ({ page }) => {
    let amenities = [{ id: "a-1", label: "Piscine", slug: "piscine" }]

    await page.route("**/api/v1/amenities", async (route) => {
      await route.fulfill({ json: { data: amenities, message: "ok" } })
    })

    await page.route("**/api/v1/admin/amenities", async (route) => {
      const newAmenity = { id: "a-2", label: "Climatisation", slug: "climatisation" }
      amenities = [...amenities, newAmenity]
      await route.fulfill({ json: { data: newAmenity, message: "ok" } })
    })

    await page.goto("/fr/admin/contenu/equipements")

    await expect(page.getByRole("heading", { name: "Équipements" })).toBeVisible()
    await expect(page.getByRole("cell", { name: "Piscine", exact: true })).toBeVisible()

    await page.getByPlaceholder("Nom de l'équipement").fill("Climatisation")
    await page.getByRole("button", { name: "Ajouter" }).click()

    await expect(page.getByText("Équipement ajouté.")).toBeVisible()
    await expect(page.getByRole("cell", { name: "Climatisation", exact: true })).toBeVisible()
  })
})
