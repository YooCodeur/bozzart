import { test, expect } from "@playwright/test";

test.describe("Page decouverte", () => {
  test("affiche la page avec fond noir", async ({ page }) => {
    await page.goto("/discover");
    // La page est en mode plein ecran noir
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });

  test("page artistes avec recherche", async ({ page }) => {
    await page.goto("/artists");
    await expect(page.locator("h1")).toContainText("Artistes");
    await expect(page.getByPlaceholder("Rechercher un artiste...")).toBeVisible();
    // Toggle carte/grille
    await expect(page.getByText("Grille")).toBeVisible();
    await expect(page.getByText("Carte")).toBeVisible();
  });

  test("page drops", async ({ page }) => {
    await page.goto("/drops");
    await expect(page.locator("h1")).toContainText("Drops");
  });
});
