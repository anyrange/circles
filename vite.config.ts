import { defineConfig } from "vite-plus";

export default defineConfig({
  defaultPackage: "./apps/frontend",
  test: {
    projects: [
      "./apps/backend/vite.config.ts",
      "./apps/frontend/vitest.unit.config.ts",
      "./apps/frontend/vitest.browser.config.ts",
      "./packages/utils/vite.config.ts",
    ],
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
    ignorePatterns: ["dist/**", ".agents/**"],
    jsPlugins: [{ name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" }],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      "anti-slop/no-chained-type-assertions": "error",
      "anti-slop/no-conditional-empty-object-spread": "error",
      "anti-slop/no-known-value-widening": "error",
      "anti-slop/no-module-mocking": "error",
      "anti-slop/no-object-parameters": "error",
      "anti-slop/no-reflect-apply": "error",
      "anti-slop/no-reflect-get": "error",
      "anti-slop/no-runtime-typeof": "error",
      "anti-slop/no-shape-in-symbol-names": "error",
      "anti-slop/no-unknown-parameters": "error",
      "anti-slop/no-unknown-returns": "error",
      "anti-slop/no-unknown-type-aliases": "error",
      "anti-slop/no-unsafe-dictionary-type": "error",
      "anti-slop/no-widen-then-assert": "error",
      "anti-slop/require-safety-comment-for-type-assertion": "error",
    },
  },
});
