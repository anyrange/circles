import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  globalSetup: "./e2e/global.setup.ts",
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "vp run @circles/backend#dev:api",
      env: {
        ...process.env,
        ENABLE_E2E_AUTH: "true",
        FRONTEND_URL: "http://127.0.0.1:3000",
        HATCHET_CLIENT_TOKEN:
          process.env.HATCHET_CLIENT_TOKEN ??
          "eyJhbGciOiJFUzI1NiIsImtpZCI6Ik50bDNOQSJ9.eyJhdWQiOiJodHRwOi8vbG9jYWxob3N0Ojg4ODgiLCJleHAiOjQ5Mjc0MjgxOTYsImdycGNfYnJvYWRjYXN0X2FkZHJlc3MiOiJsb2NhbGhvc3Q6NzA3NyIsImlhdCI6MTc3MzgyODE5NiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4ODg4Iiwic2VydmVyX3VybCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODg4OCIsInN1YiI6IjJjMTEwMGExLTgxMzUtNDJlNi1hMGZjLTFkYmIxYzgzOWE4MyIsInRva2VuX2lkIjoiODRiNTRiYTQtNzc0My00MTgyLTkzMTEtMDhlNDI2MDU4NWE2In0.zqc2yNX042xgJbgalA1zkCrVSmHeoRZkkKajcOzc2_lu31FEjtGXC6qdH1di-BFLPzIn0vz65Yb5J-FGKp-FjQ",
      },
      url: "http://127.0.0.1:8000/health",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "vp dev --port 3000",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
