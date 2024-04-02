import { createMongoClient } from "@circles/database"
import { MONGO_URL } from "../../config"

export const db = createMongoClient(MONGO_URL)
