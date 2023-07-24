import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL must be defined in env")
  process.exit(1)
}

const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 })

migrate(drizzle(migrationClient), { migrationsFolder: "../drizzle" })
