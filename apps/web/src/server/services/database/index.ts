import { createPostgresClient } from "@circles/database"
import { DATABASE_URL } from "~~/config/env"

export const controllers = createPostgresClient(DATABASE_URL)
