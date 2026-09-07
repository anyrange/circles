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

  BETTER_AUTH_SECRET: str({ devDefault: "dev-secret-change-in-production-32ch" }),
  SPOTIFY_CLIENT_ID: str({ default: "" }),
  SPOTIFY_CLIENT_SECRET: str({ default: "" }),

  HATCHET_CLIENT_TOKEN: str({ default: "" }),

  S3_BUCKET: str({ default: "" }),
  S3_REGION: str({ default: "us-east-1" }),
  S3_ACCESS_KEY_ID: str({ default: "" }),
  S3_SECRET_ACCESS_KEY: str({ default: "" }),
  S3_ENDPOINT: str({ default: "" }),
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
    scopes: ["user-read-private", "user-read-recently-played", "user-library-read"],
  },
  hatchet: {
    token: env.HATCHET_CLIENT_TOKEN,
  },
  s3: {
    bucket: env.S3_BUCKET,
    region: env.S3_REGION,
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    endpoint: env.S3_ENDPOINT || undefined,
  },
};
