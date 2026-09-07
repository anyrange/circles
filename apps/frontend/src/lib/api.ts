import type { AppType } from "@circles/backend/src/api/index.ts";
import { hc } from "hono/client";

export const api = hc<AppType>("/api", {
  init: { credentials: "same-origin" },
});
