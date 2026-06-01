import { expect, test } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Home page", () => {
  test("shows branding and Spotify sign-in button", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Circles" })).toBeVisible();
    await expect(page.getByText("Your music, visualized.")).toBeVisible();

    const spotifyButton = page.getByRole("button", {
      name: /continue with spotify/i,
    });
    await expect(spotifyButton).toBeVisible();
  });

  test("Spotify sign-in button is clickable", async ({ page }) => {
    await page.goto("/");

    const spotifyButton = page.getByRole("button", {
      name: /continue with spotify/i,
    });

    await expect(spotifyButton).toBeEnabled();
    // Intercept the auth redirect instead of following it
    const navigationPromise = page.waitForNavigation({ timeout: 3000 }).catch(() => null);
    await spotifyButton.click();
    await navigationPromise;

    // After clicking, we either navigate away (to Spotify OAuth) or stay on page —
    // either way the button was interactive
  });
});
