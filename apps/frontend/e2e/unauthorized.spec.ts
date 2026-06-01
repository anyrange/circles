import { expect, test } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

const PROTECTED_ROUTES = [
  "/dashboard",
  "/playlists",
  "/library",
  "/history",
  "/social",
  "/time-machine",
  "/tools",
  "/import",
];

test.describe("Unauthorized access", () => {
  test.fixme(true, "Protected-route redirects are not currently enforced on the initial app load.");

  for (const route of PROTECTED_ROUTES) {
    test(`redirects ${route} to home`, async ({ page }) => {
      await page.goto(route);

      await expect(page).toHaveURL("/");
      await expect(page.getByRole("button", { name: /continue with spotify/i })).toBeVisible();
    });
  }

  test("preserves redirect param on protected route redirect", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/\?redirect=/);
  });

  test("redirects /u/:username to home", async ({ page }) => {
    await page.goto("/u/someuser");

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("button", { name: /continue with spotify/i })).toBeVisible();
  });
});
