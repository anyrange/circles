import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    API_URL: z.string().url().default("http://127.0.0.1:8000"),
  },
  runtimeEnv: { ...process.env, ...import.meta.env },
  emptyStringAsUndefined: true,
});
