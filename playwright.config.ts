import { defineConfig, devices } from "@playwright/test";

const frontendUrl = process.env.E2E_FRONTEND_URL ?? "http://127.0.0.1:3000";
const apiBaseUrl = process.env.E2E_API_URL ?? "http://127.0.0.1:8080/api";
const reuseExistingServer = process.env.E2E_REUSE_SERVER === "true";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: frontendUrl,
    trace: "retain-on-failure"
  },
  webServer: [
    {
      command: "npm run dev:api",
      url: `${apiBaseUrl}/health`,
      reuseExistingServer,
      timeout: 30_000
    },
    {
      command: "npm run dev:web",
      url: frontendUrl,
      reuseExistingServer,
      timeout: 30_000
    }
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
