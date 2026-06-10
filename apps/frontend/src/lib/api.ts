import type { AppType } from "@circles/backend/src/api/index.ts";
import { hc } from "hono/client";

import { env } from "../env";

export const api = hc<AppType>(env.VITE_API_URL, {
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, { ...init, credentials: "include" }),
});
