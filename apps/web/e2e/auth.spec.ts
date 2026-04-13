import { test, expect } from "@playwright/test";

test.describe("Authentification", () => {
  test("page login s'affiche", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Connexion");
    await expect(page.getByPlaceholder("vous@exemple.com")).toBeVisible();
    await expect(page.getByRole("button", { name: "Envoyer le lien magique" })).toBeVisible();
  });

  test("page signup s'affiche avec choix de role", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator("h1")).toContainText("Inscription");
    await expect(page.getByText("Acheteur / Collectionneur")).toBeVisible();
    await expect(page.getByText("Artiste")).toBeVisible();
    await expect(page.getByPlaceholder("marie-dupont")).toBeVisible();
  });

  test("redirection dashboard si non connecte", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirection admin si non connecte", async ({ page }) => {
    await page.goto("/admin/artists");
    await expect(page).toHaveURL(/\/login/);
  });
});
