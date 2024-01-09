import { createPostgresClient } from "@circles/database"
import { DATABASE_URL } from "../../config"

export const controllers = createPostgresClient(DATABASE_URL)
