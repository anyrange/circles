import path from "path";

import react from "@vitejs/plugin-react";

export const frontendVitestConfig = {
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
} as const;
