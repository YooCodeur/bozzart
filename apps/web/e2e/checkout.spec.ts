import { test, expect } from "@playwright/test";

test.describe("Checkout", () => {
  test("page success s'affiche", async ({ page }) => {
    await page.goto("/checkout/success");
    await expect(page.locator("h1")).toContainText("Merci");
    await expect(page.getByRole("link", { name: "Voir ma collection" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Continuer a decouvrir" })).toBeVisible();
  });
});
