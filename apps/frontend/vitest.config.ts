import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    root: import.meta.dirname,
    exclude: ["**/node_modules/**", "**/e2e/**"],
    projects: ["./vitest.unit.config.ts", "./vitest.browser.config.ts"],
  },
});
