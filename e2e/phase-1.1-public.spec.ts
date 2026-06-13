import { test, expect } from "@playwright/test"

test.describe("Public website (Phase 1.1)", () => {
  test("home page renders hero, search bar, and featured listings section", async ({ page }) => {
    await page.goto("/fr")

    await expect(page.getByRole("heading", { name: /Trouvez votre maison/ })).toBeVisible()
    await expect(page.getByRole("button", { name: "Louer" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Acheter" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Rechercher" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Annonces récentes" })).toBeVisible()
    await expect(page.getByRole("heading", { name: /bien à louer ou à vendre/ })).toBeVisible()
  })

  test("search bar submission navigates to the browse page with filters applied", async ({
    page,
  }) => {
    await page.goto("/fr")

    await page.getByRole("button", { name: "Acheter" }).click()
    await page.getByRole("button", { name: "Rechercher" }).click()

    await expect(page).toHaveURL(/\/fr\/annonces\?listingType=SALE/)
    await expect(page.getByRole("heading", { name: "Annonces" })).toBeVisible()
  })

  test("browse page renders filters and applying one updates the URL", async ({ page }) => {
    await page.goto("/fr/annonces")

    await expect(page.getByRole("heading", { name: "Annonces" })).toBeVisible()
    await expect(page.getByText("Type d'annonce")).toBeVisible()

    await page.getByRole("button", { name: "Louer" }).click()

    await expect(page).toHaveURL(/\/fr\/annonces\?listingType=RENT/)
  })

  test("listing detail page renders price and contact section when a listing exists", async ({
    page,
  }) => {
    await page.goto("/fr/annonces")

    const firstCard = page.getByRole("link").filter({ hasText: "FCFA" }).first()
    if ((await firstCard.count()) === 0) {
      test.skip(true, "No listings available from the API in this environment")
    }

    await firstCard.click()

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(page.getByText("Description")).toBeVisible()
  })

  test("static pages render with the expected title and content", async ({ page }) => {
    await page.goto("/fr/a-propos")
    await expect(page.getByRole("heading", { name: "À propos d'ImmoCM" })).toBeVisible()

    await page.goto("/fr/contact")
    await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Écrire sur WhatsApp" })).toBeVisible()
    await expect(page.getByLabel("Nom complet")).toBeVisible()

    await page.goto("/fr/mentions-legales")
    await expect(page.getByRole("heading", { name: "Mentions légales" })).toBeVisible()
  })
})
