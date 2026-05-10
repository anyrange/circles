import { defineProject } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";

import { frontendVitestConfig } from "./vitest.shared.ts";

const browserProject = {
  ...frontendVitestConfig,
  test: {
    name: "browser",
    root: import.meta.dirname,
    setupFiles: ["./src/test/setup.browser.ts"],
    include: ["src/**/*.browser.spec.{ts,tsx}"],
    typecheck: { enabled: true },
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
};

export default defineProject(browserProject as never);
