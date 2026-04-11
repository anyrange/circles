import { randomBytes, randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { setSignedCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";

import { config } from "../../config";
import { db as drizzleDb } from "../../db/postgres";
import * as schema from "../../db/postgres/schema";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const SESSION_COOKIE_NAME = "better-auth.session_token";

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

  await drizzleDb.delete(schema.session).where(eq(schema.session.userId, user.id));

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);

  await drizzleDb.insert(schema.session).values({
    id: randomUUID(),
    userId: user.id,
    token,
    expiresAt,
    ipAddress: ctx.req.header("x-forwarded-for") ?? null,
    userAgent: ctx.req.header("user-agent") ?? null,
    createdAt: now,
    updatedAt: now,
  });

  await setSignedCookie(ctx, SESSION_COOKIE_NAME, token, config.auth.secret, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    secure: false,
    maxAge: SESSION_TTL_SECONDS,
  });

  return ctx.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});
