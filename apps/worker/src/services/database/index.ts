import { createPostgresClient } from "@circles/database"
import { POSTGRES_URL } from "../../config"

export const controllers = createPostgresClient(POSTGRES_URL)
