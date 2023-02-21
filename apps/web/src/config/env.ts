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
