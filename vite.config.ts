import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    ignorePatterns: ["dist/**", "**/migrations/**", "routeTree.gen.ts"],
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
