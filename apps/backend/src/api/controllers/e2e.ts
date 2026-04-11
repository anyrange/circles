import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";

import { config } from "../../config";
import { db as drizzleDb } from "../../db/postgres";
import * as schema from "../../db/postgres/schema";
import { auth } from "../../library/auth";

const E2E_USER = {
  email: "e2e@circles.local",
  name: "Circles E2E",
};

export const e2eController = new Hono().post("/test/e2e/login", async (ctx) => {
  if (!config.e2e.enableAuth) {
    throw new HTTPException(404, { message: "Not found" });
  }

  const now = new Date();

  let [user] = await drizzleDb
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, E2E_USER.email))
    .limit(1);

  if (!user) {
    [user] = await drizzleDb
      .insert(schema.user)
      .values({
        id: randomUUID(),
        email: E2E_USER.email,
        emailVerified: true,
        name: E2E_USER.name,
        isPublic: true,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
  } else if (user.name !== E2E_USER.name || !user.emailVerified) {
    [user] = await drizzleDb
      .update(schema.user)
      .set({
        name: E2E_USER.name,
        emailVerified: true,
        updatedAt: now,
      })
      .where(eq(schema.user.id, user.id))
      .returning();
  }

  const authContext = await auth.$context;

  await authContext.internalAdapter.deleteSessions(user.id);

  const cookies = await authContext.test.getCookies({ userId: user.id });
  for (const cookie of cookies) {
    setCookie(ctx, cookie.name, cookie.value, {
      expires: cookie.expires ? new Date(cookie.expires * 1000) : undefined,
      httpOnly: cookie.httpOnly,
      path: cookie.path,
      sameSite: cookie.sameSite,
      secure: cookie.secure,
    });
  }

  return ctx.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});
