import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";

import { config } from "../../config";
import { auth } from "../../library/auth";

export type AuthVariables = {
  userId: string;
};

export const authMiddleware: MiddlewareHandler<{
  Variables: AuthVariables;
}> = async (ctx, next) => {
  // Cookies authenticate writes too, so reject requests from other origins.
  if (
    !["GET", "HEAD", "OPTIONS"].includes(ctx.req.method) &&
    ctx.req.header("Origin") !== new URL(config.frontend.url).origin
  ) {
    throw new HTTPException(403, { message: "Invalid request origin" });
  }

  const { response: session, headers } = await auth.api.getSession({
    headers: ctx.req.raw.headers,
    returnHeaders: true,
  });
  for (const cookie of headers.getSetCookie()) {
    ctx.header("Set-Cookie", cookie, { append: true });
  }
  ctx.header("Cache-Control", "private, no-store");

  if (!session) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  ctx.set("userId", session.user.id);
  return next();
};
