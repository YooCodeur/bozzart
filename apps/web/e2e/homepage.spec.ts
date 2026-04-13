import { test, expect } from "@playwright/test";

test.describe("Page d'accueil", () => {
  test("affiche le hero et la navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("art contemporain");
    await expect(page.getByRole("link", { name: "Decouvrir" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Artistes" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Drops" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Connexion" })).toBeVisible();
  });

  test("navigation vers decouvrir", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Decouvrir les oeuvres" }).click();
    await expect(page).toHaveURL("/discover");
  });

  test("navigation vers artistes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Artistes" }).first().click();
    await expect(page).toHaveURL("/artists");
    await expect(page.locator("h1")).toContainText("Artistes");
  });
});
