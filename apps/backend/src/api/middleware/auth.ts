import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";

import { verifyOAuthAccessToken } from "../../library/auth";

export type AuthVariables = {
  userId: string;
};

export const authMiddleware: MiddlewareHandler<{
  Variables: AuthVariables;
}> = async (ctx, next) => {
  const authorization = ctx.req.header("Authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  let userId: string | undefined;
  try {
    userId = (await verifyOAuthAccessToken(token)).payload?.sub;
  } catch {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  if (!userId) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  ctx.set("userId", userId);

  return next();
};
