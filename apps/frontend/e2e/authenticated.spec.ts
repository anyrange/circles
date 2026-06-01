import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "@playwright/test";

const authFile = path.join(path.dirname(fileURLToPath(import.meta.url)), ".auth/user.json");

test.use({ storageState: authFile });

test.describe("Authenticated app", () => {
  test("signed-in users can access the dashboard", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Playlists" })).toBeVisible();
  });

  test("signed-in users can open the playlists page", async ({ page }) => {
    await page.goto("/playlists");

    await expect(page).toHaveURL(/\/playlists$/);
    await expect(page.getByRole("heading", { name: "Playlists" })).toBeVisible();
    await expect(page.getByRole("button", { name: "New playlist" })).toBeVisible();
  });
});
