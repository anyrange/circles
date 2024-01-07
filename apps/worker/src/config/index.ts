import { error } from "@circles/utils"
import * as dotenv from "dotenv"

dotenv.config()

if (typeof process.env.SPOTIFY_CLIENT_SECRET !== "string") {
  error("SPOTIFY_CLIENT_SECRET must be defined in env")
  process.exit(1)
}

if (typeof process.env.SPOTIFY_CLIENT_ID !== "string") {
  error("SPOTIFY_CLIENT_ID must be defined in env")
  process.exit(1)
}

if (typeof process.env.DATABASE_URL !== "string") {
  error("DATABASE_URL must be defined in env")
  process.exit(1)
}

export const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, DATABASE_URL } =
  process.env

export const PORT = Number(process.env.PORT) || 7777
