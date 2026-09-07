import { once } from "node:events";
import { createServer } from "node:http";

import { afterAll, beforeAll, expect, test } from "vite-plus/test";
import { z } from "zod";

import { proxyApiRequest } from "./api-proxy";

const backend = createServer(async (request, response) => {
  if (request.url === "/api/auth/callback/spotify?code=test") {
    response.writeHead(302, {
      Location: "http://frontend.test/dashboard",
      "Set-Cookie": ["session=new; HttpOnly; Path=/", "state=; Max-Age=0; Path=/"],
    });
    response.end();
    return;
  }
  let body = "";
  for await (const chunk of request) body += chunk;
  response.setHeader("Content-Type", "application/json");
  response.end(
    JSON.stringify({
      path: request.url,
      method: request.method,
      cookie: request.headers.cookie,
      origin: request.headers.origin,
      forwardedHost: request.headers["x-forwarded-host"] ?? null,
      forwardedProto: request.headers["x-forwarded-proto"] ?? null,
      body,
    }),
  );
});
let backendOrigin: string;

beforeAll(async () => {
  backend.listen(0, "127.0.0.1");
  await once(backend, "listening");
  const address = z.object({ port: z.number() }).parse(backend.address());
  backendOrigin = `http://127.0.0.1:${address.port}`;
});
afterAll(
  () =>
    new Promise<void>((resolve, reject) => {
      backend.close((error) => (error ? reject(error) : resolve()));
      backend.closeAllConnections();
    }),
);

test("forwards cookie-authenticated writes, query parameters, and their original origin", async () => {
  const response = await proxyApiRequest(
    new Request("http://frontend.test/api/playlists?limit=2", {
      method: "POST",
      headers: {
        Cookie: "session=test",
        Origin: "http://frontend.test",
        "X-Forwarded-Host": "attacker.test",
        "X-Forwarded-Proto": "https",
      },
      body: "playlist data",
    }),
    backendOrigin,
  );
  expect(await response.json()).toEqual({
    path: "/playlists?limit=2",
    method: "POST",
    cookie: "session=test",
    origin: "http://frontend.test",
    forwardedHost: null,
    forwardedProto: null,
    body: "playlist data",
  });
  expect(response.headers.get("cache-control")).toBe("private, no-store");
});

test("preserves OAuth callback redirects and multiple Set-Cookie headers", async () => {
  const response = await proxyApiRequest(
    new Request("http://frontend.test/api/auth/callback/spotify?code=test"),
    backendOrigin,
  );
  expect(response.status).toBe(302);
  expect(response.headers.get("location")).toBe("http://frontend.test/dashboard");
  expect(response.headers.getSetCookie()).toEqual([
    "session=new; HttpOnly; Path=/",
    "state=; Max-Age=0; Path=/",
  ]);
});

test("keeps a double-slash path on the configured backend", async () => {
  const response = await proxyApiRequest(
    new Request("http://frontend.test/api//attacker.test/me"),
    backendOrigin,
  );
  expect(await response.json()).toMatchObject({ path: "//attacker.test/me" });
});
