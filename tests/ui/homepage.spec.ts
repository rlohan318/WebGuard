import { expect, test } from "@playwright/test";

test("homepage loads and identifies the Automation Exercise site", async ({ page }) => {
  const isDemo = process.env.WEBGUARD_DEMO === "1";
  const targetPath = isDemo ? "/demo-site" : "/";
  const response = await page.goto(targetPath, { waitUntil: "domcontentloaded" });
  expect(
    response?.ok(),
    `Navigation to ${page.url()} should succeed; received HTTP ${response?.status() ?? "no response"}.`,
  ).toBeTruthy();

  const actualTitle = await page.title();
  const expectedHeading = "Full-Fledged practice website for Automation Engineers";
  const titleExpectation = expect.soft(
    page,
    isDemo
      ? "Known demo defect: the page title does not identify the expected Automation Exercise site."
      : `Target ${page.url()} loaded with title ${JSON.stringify(actualTitle)}; this smoke test expects the Automation Exercise homepage.`,
  ).toHaveTitle(/Automation Exercise/i, { timeout: 5_000 });

  const visibleHeadings = await page.locator("h1:visible, h2:visible, h3:visible").allTextContents();
  const headingExpectation = expect.soft(
    page.getByRole("heading", { name: expectedHeading, exact: true }),
    isDemo
      ? `Known demo defect: expected heading ${JSON.stringify(expectedHeading)} is missing. Visible headings: ${JSON.stringify(visibleHeadings)}.`
      : `Expected the main Automation Exercise heading on ${page.url()}. Visible headings: ${JSON.stringify(visibleHeadings)}.`,
  ).toBeVisible({ timeout: 5_000 });

  await Promise.all([titleExpectation, headingExpectation]);
});
