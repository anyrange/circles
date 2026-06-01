import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, request } from "@playwright/test";

export default async function globalSetup() {
  const statePath = path.join(path.dirname(fileURLToPath(import.meta.url)), ".auth/user.json");
  const apiURL = process.env.PLAYWRIGHT_API_URL ?? "http://127.0.0.1:8000";

  mkdirSync(path.dirname(statePath), { recursive: true });

  const context = await request.newContext();
  const response = await context.post(`${apiURL}/test/e2e/login`);

  if (!response.ok()) {
    throw new Error(
      `E2E auth bootstrap failed with ${response.status()}: ${await response.text()}`,
    );
  }

  expect(response.ok()).toBeTruthy();

  await context.storageState({ path: statePath });
  await context.dispose();
}
