import { defineConfig } from "vite-plus/pack";

export default defineConfig({
  entry: ["src/**/*.ts", "!src/**/*.spec.ts"],
  dts: {
    tsgo: true,
  },
  exports: true,
});
