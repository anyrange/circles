import { defineConfig } from "drizzle-kit";

import { env } from "./src/config";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/postgres/schema.ts",
  out: "./src/db/postgres/migrations",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
