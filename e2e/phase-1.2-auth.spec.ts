import { test, expect } from "@playwright/test"

import { UserRole } from "@/types/enums"

const AUTH_COOKIE_NAME = "token"

function makeToken(role: UserRole): string {
  const payload = Buffer.from(JSON.stringify({ role })).toString("base64url")
  return `header.${payload}.signature`
}

test.describe("Authentication pages (Phase 1.2)", () => {
  test("register page renders the form and validates required fields", async ({ page }) => {
    await page.goto("/fr/inscription")

    await expect(page.getByRole("heading", { name: "Créer un compte" })).toBeVisible()
    await expect(page.getByLabel("Nom complet")).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Téléphone")).toBeVisible()

    await page.getByRole("button", { name: "S'inscrire" }).click()

    await expect(page.getByText("Ce champ est requis").first()).toBeVisible()

    await page.getByRole("link", { name: "Se connecter" }).click()
    await expect(page).toHaveURL(/\/fr\/connexion$/)
  })

  test("login page renders the form, validates required fields, and links to register/forgot password", async ({
    page,
  }) => {
    await page.goto("/fr/connexion")

    await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible()

    await page.getByRole("button", { name: "Se connecter" }).click()
    await expect(page.getByText("Ce champ est requis").first()).toBeVisible()

    await expect(page.getByRole("link", { name: "Mot de passe oublié ?" })).toHaveAttribute(
      "href",
      "/fr/mot-de-passe-oublie"
    )

    await page.getByRole("link", { name: "S'inscrire" }).click()
    await expect(page).toHaveURL(/\/fr\/inscription$/)
  })

  test("forgot password page shows a generic confirmation message on submit", async ({
    page,
  }) => {
    await page.goto("/fr/mot-de-passe-oublie")

    await expect(page.getByRole("heading", { name: "Mot de passe oublié" })).toBeVisible()

    await page.getByLabel("Email").fill("jean@example.com")
    await page.getByRole("button", { name: "Envoyer le lien" }).click()

    await expect(
      page.getByText(
        "Si un compte existe avec cette adresse, un lien de réinitialisation a été envoyé."
      )
    ).toBeVisible()
  })

  test("reset password page without a token shows an invalid link message", async ({ page }) => {
    await page.goto("/fr/reinitialiser-mot-de-passe")

    await expect(page.getByRole("heading", { name: "Lien invalide" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Demander un nouveau lien" })).toHaveAttribute(
      "href",
      "/fr/mot-de-passe-oublie"
    )
  })

  test("reset password page with a token shows the new password form", async ({ page }) => {
    await page.goto("/fr/reinitialiser-mot-de-passe?token=sometoken")

    await expect(page.getByRole("heading", { name: "Réinitialiser le mot de passe" })).toBeVisible()
    await expect(page.getByLabel("Mot de passe", { exact: true })).toBeVisible()
    await expect(page.getByLabel("Confirmer le mot de passe")).toBeVisible()
  })

  test("email verification page shows an error and resend form for an invalid token", async ({
    page,
  }) => {
    await page.goto("/fr/verify-email/invalid-token")

    await expect(page.getByRole("heading", { name: "Lien invalide ou expiré" })).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Renvoyer l'email de vérification" })
    ).toBeVisible()
  })

  test("authenticated users are redirected away from /connexion and /inscription", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: AUTH_COOKIE_NAME,
        value: makeToken(UserRole.AGENT),
        domain: "localhost",
        path: "/",
      },
    ])

    await page.goto("/fr/connexion")
    await expect(page).toHaveURL(/\/fr\/agent\/tableau-de-bord$/)

    await page.goto("/fr/inscription")
    await expect(page).toHaveURL(/\/fr\/agent\/tableau-de-bord$/)
  })
})
