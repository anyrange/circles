import { and, eq, gt } from "drizzle-orm";
import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";

import { db as drizzleDb } from "../../db/postgres";
import { session as sessionTable } from "../../db/postgres/schema";
import { auth } from "../../library/auth";

export type AuthVariables = {
  userId: string;
};

export const authMiddleware: MiddlewareHandler<{
  Variables: AuthVariables;
}> = async (ctx, next) => {
  const authorization = ctx.req.header("authorization");
  const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (bearerToken) {
    const [bearerSession] = await drizzleDb
      .select({ userId: sessionTable.userId })
      .from(sessionTable)
      .where(and(eq(sessionTable.token, bearerToken), gt(sessionTable.expiresAt, new Date())))
      .limit(1);

    if (bearerSession) {
      ctx.set("userId", bearerSession.userId);
      return next();
    }
  }

  const session = await auth.api.getSession({ headers: ctx.req.raw.headers });

  if (!session) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  ctx.set("userId", session.user.id);

  return next();
};
