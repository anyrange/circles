import { defineProject } from "vite-plus";

import { frontendVitestConfig } from "./vitest.shared.ts";

const unitProject = {
  ...frontendVitestConfig,
  test: {
    name: "unit",
    root: import.meta.dirname,
    environment: "node",
    include: ["src/**/*.unit.spec.{ts,tsx}"],
    typecheck: { enabled: true },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.spec.{ts,tsx}",
        "src/**/__tests__/**",
        "src/test/**",
        "src/**/*.d.ts",
        "src/routeTree.gen.ts",
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
    },
  },
};

export default defineProject(unitProject as never);
