import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/e2e/**", "apps/**"],
  },
  fmt: {
    ignorePatterns: [
      "dist/**",
      "coverage/**",
      "**/coverage/**",
      "**/migrations/**",
      ".claude/**",
      ".agents/**",
      "routeTree.gen.ts",
    ],
    semi: true,
    sortImports: {},
    sortTailwindcss: {
      stylesheet: "./apps/frontend/src/styles.css",
      functions: ["cn", "clsx"],
    },
  },
  lint: {
    ignorePatterns: ["dist/**"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
});
