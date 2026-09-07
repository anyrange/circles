import type { AppType } from "@circles/backend/src/api/index.ts";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import { hc } from "hono/client";

import { env } from "../env";

export const getInitialAuthFn = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("Cache-Control", "private, no-store");
  const cookie = getRequestHeader("cookie");
  if (!cookie) return null;

  const response = await hc<AppType>(env.API_URL, { headers: { cookie } }).me.$get();
  const cookies = response.headers.getSetCookie();
  if (cookies.length) setResponseHeader("Set-Cookie", cookies);

  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`Failed to load current user (${response.status})`);
  return { user: await response.json() };
});
