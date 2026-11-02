import { expect, test } from "@playwright/test";

test("homepage loads and identifies the Automation Exercise site", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveTitle(/Automation Exercise/i, { timeout: 15_000 });
  await expect(
    page.getByRole("heading", {
      name: "Full-Fledged practice website for Automation Engineers",
    }).first(),
  ).toBeVisible({ timeout: 15_000 });
});
