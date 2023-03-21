import * as dotenv from "dotenv"

dotenv.config({ path: "../../.env" })

if (typeof process.env.SPOTIFY_CLIENT_SECRET !== "string") {
  console.error("SPOTIFY_CLIENT_SECRET must be defined in env")
  process.exit(1)
}

if (typeof process.env.SPOTIFY_CLIENT_ID !== "string") {
  console.error("SPOTIFY_CLIENT_ID must be defined in env")
  process.exit(1)
}

export const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env

export const BASE_ROUTE = "https://api.spotify.com/v1/"

export const TOKEN_ROUTE = "https://accounts.spotify.com/api/token"

const SECOND = 1000
export const DEFAULT_RETRY_AFTER = 2 * SECOND

export const API_DEFAULT_CAPACITY = 50

export const API_ALBUM_CAPACITY = 20
