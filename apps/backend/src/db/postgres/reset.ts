import pg from "pg";

import { env } from "../../config";

if (env.isProduction) {
  throw new Error("db:reset is disabled in production");
}

const client = new pg.Client({ connectionString: env.DATABASE_URL });
try {
  await client.connect();
  // Remove migration history with the application schema so migrate rebuilds both.
  await client.query("BEGIN");
  await client.query("DROP SCHEMA IF EXISTS public CASCADE");
  await client.query("DROP SCHEMA IF EXISTS drizzle CASCADE");
  await client.query("CREATE SCHEMA public");
  await client.query("COMMIT");
} finally {
  await client.end();
}
