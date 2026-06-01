import { defineConfig } from "vite-plus";

import tsdownConfig from "./tsdown.config.js";

export default defineConfig({
  pack: tsdownConfig,
  test: {
    root: import.meta.dirname,
    coverage: {
      reporter: ["text", "html", "json-summary"],
    },
  },
});
