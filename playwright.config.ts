import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "https://automationexercise.com";

const isFirefoxEnabled = process.env.PLAYWRIGHT_INCLUDE_FIREFOX === "1";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    ...(isFirefoxEnabled
      ? [
          {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
          },
        ]
      : []),
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
