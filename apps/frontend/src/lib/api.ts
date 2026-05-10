import type { AppType } from "@circles/backend/src/api/index.ts";
import { hc } from "hono/client";

import { env } from "../env";
import { getSessionToken } from "./session-token";

export const api = hc<AppType>(env.VITE_API_URL, {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    const sessionToken = getSessionToken();
    if (sessionToken) headers.set("Authorization", `Bearer ${sessionToken}`);

    return fetch(input, { ...init, credentials: "include", headers });
  },
});
