import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "@playwright/test";

const authFile = path.join(path.dirname(fileURLToPath(import.meta.url)), ".auth/user.json");

test.use({ storageState: authFile });

test.describe("Authenticated app", () => {
  test("redirects signed-in users to the dashboard", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Playlists" })).toBeVisible();
  });

  test("can create and delete a playlist", async ({ page }) => {
    const playlistName = `E2E Playlist ${Date.now()}`;

    await page.goto("/playlists");

    await expect(page.getByRole("heading", { name: "Playlists" })).toBeVisible();

    await page.getByRole("button", { name: "New playlist" }).click();
    await page.getByPlaceholder("Playlist name").fill(playlistName);
    await page.getByRole("button", { name: "Create" }).click();

    const playlistCard = page.getByText(playlistName);
    await expect(playlistCard).toBeVisible();

    await page.getByRole("button", { name: "Delete" }).click();
    await expect(playlistCard).toHaveCount(0);
  });
});
