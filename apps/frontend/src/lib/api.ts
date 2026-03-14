import type { AppType } from "@circles/backend/src/api/index.ts";
import { hc } from "hono/client";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export const api = hc<AppType>(API_URL, {
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, { ...init, credentials: "include" }),
});
