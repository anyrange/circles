import { defineConfig } from "vite-plus";

import tsdownConfig from "./tsdown.config.js";

export default defineConfig({
  pack: tsdownConfig,
  test: {
    root: import.meta.dirname,
    environment: "node",
    typecheck: { enabled: true },
    watch: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.spec.ts"],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
    },
  },
});
