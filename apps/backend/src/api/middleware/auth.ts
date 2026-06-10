import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";

import { auth } from "../../library/auth";

export type AuthVariables = {
  userId: string;
};

export const authMiddleware: MiddlewareHandler<{
  Variables: AuthVariables;
}> = async (ctx, next) => {
  const session = await auth.api.getSession({ headers: ctx.req.raw.headers });

  if (!session) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  ctx.set("userId", session.user.id);

  return next();
};
