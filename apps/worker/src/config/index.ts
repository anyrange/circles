import { error } from "@circles/utils"
import * as dotenv from "dotenv"

dotenv.config({ path: "../../.env" })

if (typeof process.env.SPOTIFY_CLIENT_SECRET !== "string") {
  error("SPOTIFY_CLIENT_SECRET must be defined in env")
  process.exit(1)
}

if (typeof process.env.SPOTIFY_CLIENT_ID !== "string") {
  error("SPOTIFY_CLIENT_ID must be defined in env")
  process.exit(1)
}

if (typeof process.env.POSTGRES_URL !== "string") {
  error("POSTGRES_URL must be defined in env")
  process.exit(1)
}

export const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, POSTGRES_URL } =
  process.env

export const PORT = Number(process.env.PORT) || 7777

export const MAX_WORKER_LOAD = 1000
