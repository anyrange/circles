import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    SESSION_SECRET: z.string().min(32).default("circles-development-session-secret"),
    FRONTEND_URL: z.string().url().default("http://127.0.0.1:3000"),
  },
  clientPrefix: "VITE_",
  client: {
    VITE_API_URL: z.string().url().default("http://127.0.0.1:8000"),
    VITE_OAUTH_CLIENT_ID: z.string().min(1).default("circles-frontend"),
  },
  runtimeEnv: { ...process.env, ...import.meta.env },
  emptyStringAsUndefined: true,
});
