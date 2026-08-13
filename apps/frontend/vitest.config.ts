import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    root: import.meta.dirname,
    exclude: ["**/node_modules/**"],
    projects: ["./vitest.unit.config.ts", "./vitest.browser.config.ts"],
  },
});
