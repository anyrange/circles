import type { AppType } from "@circles/backend/src/api/index.ts";
import { hc } from "hono/client";

import { env } from "../env";
import { getAccessToken as getStoredAccessToken } from "./access-token";

type AuthenticatedFetchOptions = {
  fetch: typeof globalThis.fetch;
  getAccessToken: () => string | null;
};

export function createAuthenticatedFetch(options: AuthenticatedFetchOptions) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    const accessToken = options.getAccessToken();
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

    if (import.meta.env.DEV) {
      console.log("[api] request", {
        authenticated: Boolean(accessToken),
        method: init?.method ?? "GET",
        url: input instanceof Request ? input.url : input.toString(),
      });
    }

    const response = await options.fetch.call(globalThis, input, { ...init, headers });
    if (import.meta.env.DEV) {
      console.log("[api] response", { status: response.status, url: response.url });
    }
    return response;
  };
}

const authenticatedFetch = createAuthenticatedFetch({
  fetch: globalThis.fetch,
  getAccessToken: getStoredAccessToken,
});

export const api = hc<AppType>(env.VITE_API_URL, {
  fetch: authenticatedFetch,
});
