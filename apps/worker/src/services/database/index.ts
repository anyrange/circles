import { createDBClient } from "@circles/database"
import { DATABASE_URL } from "../../config"

export const controllers = createDBClient(DATABASE_URL)
