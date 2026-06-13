import { test, expect } from "@playwright/test"

test.describe("Global layout (Phase 0)", () => {
  test("redirects the root path to the default locale", async ({ page }) => {
    await page.goto("/")

    await expect(page).toHaveURL(/\/fr\/?$/)
  })

  test("renders header navigation and footer on the home page", async ({ page }) => {
    await page.goto("/fr")

    const header = page.getByRole("banner")
    await expect(header.getByRole("link", { name: "ImmoCM" })).toBeVisible()
    await expect(header.getByRole("link", { name: "Accueil" })).toBeVisible()
    await expect(header.getByRole("link", { name: "Annonces" })).toBeVisible()
    await expect(header.getByRole("link", { name: "Mettre une annonce" })).toBeVisible()
    await expect(header.getByRole("link", { name: "Connexion" })).toBeVisible()

    const footer = page.getByRole("contentinfo")
    await expect(footer.getByRole("link", { name: "À propos" })).toBeVisible()
    await expect(footer.getByRole("link", { name: "Contact" })).toBeVisible()
    await expect(footer.getByRole("link", { name: "Mentions légales" })).toBeVisible()
  })

  test("redirects unauthenticated users away from protected agent routes", async ({ page }) => {
    await page.goto("/fr/agent/tableau-de-bord")

    await expect(page).toHaveURL(/\/fr\/connexion$/)
  })

  test("redirects unauthenticated users away from protected admin routes", async ({ page }) => {
    await page.goto("/fr/admin/tableau-de-bord")

    await expect(page).toHaveURL(/\/fr\/connexion$/)
  })
})
