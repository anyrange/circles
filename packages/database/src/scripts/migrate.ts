import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

if (!process.env.POSTGRES_URL) {
  console.error("POSTGRES_URL must be defined in env")
  process.exit(1)
}

const migrationClient = postgres(process.env.POSTGRES_URL, { max: 1 })

migrate(drizzle(migrationClient), { migrationsFolder: "./drizzle" })
  .then(() => console.log("Successfully migrated"))
  .catch((err) => console.log(err))
  .finally(() => process.exit(0))
