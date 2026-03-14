import "dotenv/config";
import { cleanEnv, num, str } from "envalid";

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "test", "production"],
    default: "development",
  }),

  SERVER_HOST: str({ default: "0.0.0.0" }),
  SERVER_PORT: num({ default: 8000 }),
  SERVER_URL: str({ default: "http://127.0.0.1:8000" }),

  FRONTEND_URL: str({ default: "http://127.0.0.1:3000" }),

  DATABASE_URL: str({
    default: "postgres://circles:password@127.0.0.1:5432/circles_dev",
  }),

  BETTER_AUTH_SECRET: str({ default: "dev-secret-change-in-production-32ch" }),

  SPOTIFY_CLIENT_ID: str({ default: "" }),
  SPOTIFY_CLIENT_SECRET: str({ default: "" }),

  HATCHET_CLIENT_TOKEN: str({ default: "" }),
});

export const config = {
  isDevelopment: env.isDevelopment,
  http: {
    host: env.SERVER_HOST,
    port: env.SERVER_PORT,
    url: env.SERVER_URL,
  },
  frontend: {
    url: env.FRONTEND_URL,
  },
  database: {
    url: env.DATABASE_URL,
  },
  auth: {
    secret: env.BETTER_AUTH_SECRET,
  },
  spotify: {
    clientId: env.SPOTIFY_CLIENT_ID,
    clientSecret: env.SPOTIFY_CLIENT_SECRET,
    redirectUri: `${env.SERVER_URL}/auth/spotify/callback`,
    scopes: ["user-read-private", "user-read-email", "user-read-recently-played"],
  },
  hatchet: {
    token: env.HATCHET_CLIENT_TOKEN,
  },
};
