import { cleanEnv, str, url } from "envalid"
import * as dotenv from "dotenv"

dotenv.config({ path: "../../.env" })

const env = cleanEnv(process.env, {
  SPOTIFY_CLIENT_SECRET: str(),
  SPOTIFY_CLIENT_ID: str(),
  DATABASE_URL: str(),
  APP_URL: url({ default: "http://localhost:3000" }),
  NODE_ENV: str({ choices: ["development", "test", "production", "staging"] }),
})

export const {
  APP_URL,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  DATABASE_URL,
  isProd,
  isDev,
} = env
