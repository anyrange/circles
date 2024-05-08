import { cleanEnv, str, url, num } from "envalid";
import * as dotenv from "dotenv";

dotenv.config();

export const env = cleanEnv(process.env, {
  SPOTIFY_CLIENT_SECRET: str(),
  SPOTIFY_CLIENT_ID: str(),
  JWT_SECRET: url({ default: "dev" }),
  POSTGRES_URL: str(),
  PORT: num({ default: 8000 }),
  APP_URL: url({ default: "http://localhost:8000" }),
  NODE_ENV: str({
    choices: ["development", "test", "production", "staging"],
    default: "development",
  }),
});

const SECOND = 1000;

export const api = {
  SCOPES: [
    "user-read-currently-playing",
    "user-read-recently-played",
    "user-read-private",
    "user-library-read",
    "user-follow-read",
    "user-read-email",
    "user-top-read",
  ],
  BASE_ROUTE: "https://api.spotify.com/v1/",
  TOKEN_ROUTE: "https://accounts.spotify.com/api/token",
  DEFAULT_RETRY_AFTER: 2 * SECOND,
  MAXIMUM_RETRY_COUNT: 5,
  API_DEFAULT_CAPACITY: 50,
  API_ALBUM_CAPACITY: 20,
};
