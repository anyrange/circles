import { createDBClient } from "@circles/database"
import { DATABASE_URL } from "~~/config/env"

export const controllers = createDBClient(DATABASE_URL)
