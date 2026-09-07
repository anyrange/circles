export async function proxyApiRequest(request: Request, backendOrigin: string) {
  const incoming = new URL(request.url);
  const target = new URL(backendOrigin);
  // Better Auth already lives at /api/auth; application controllers live at /.
  target.pathname = incoming.pathname.startsWith("/api/auth/")
    ? incoming.pathname
    : incoming.pathname.slice(4) || "/";
  target.search = incoming.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("forwarded");
  const forwardedHeaders = Array.from(headers.keys()).filter((name) =>
    name.startsWith("x-forwarded-"),
  );
  for (const name of forwardedHeaders) headers.delete(name);

  // Preserve redirects and every Set-Cookie header, including Spotify's state cookie.
  const init: RequestInit & { duplex: "half" } = {
    method: request.method,
    headers,
    body: request.body,
    duplex: "half",
    redirect: "manual",
    signal: request.signal,
  };
  const upstream = await fetch(target, init);
  const response = new Response(upstream.body, upstream);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
