import { expect, test, vi } from "vite-plus/test";

import { createAuthenticatedFetch } from "./api";

test("adds the current access token to requests", async () => {
  const fetch = vi.fn(async function (
    this: typeof globalThis,
    _input: RequestInfo | URL,
    init?: RequestInit,
  ) {
    expect(this).toBe(globalThis);
    const token = new Headers(init?.headers).get("Authorization");
    return new Response(null, { status: token === "Bearer current" ? 200 : 401 });
  });

  const authenticatedFetch = createAuthenticatedFetch({
    fetch,
    getAccessToken: () => "current",
  });

  const response = await authenticatedFetch("https://api.example.test/me");

  expect(response.status).toBe(200);
  expect(fetch).toHaveBeenCalledTimes(1);
});

test("leaves anonymous requests without an authorization header", async () => {
  const fetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) =>
    Response.json({ authorization: new Headers(init?.headers).get("Authorization") }),
  );
  const authenticatedFetch = createAuthenticatedFetch({
    fetch,
    getAccessToken: () => null,
  });

  const response = await authenticatedFetch("https://api.example.test/me");

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ authorization: null });
  expect(fetch).toHaveBeenCalledTimes(1);
});
