import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { db } from "../../db";
import type { AuthVariables } from "../middleware/auth";
import { authMiddleware } from "../middleware/auth";

export const meController = new Hono<{ Variables: AuthVariables }>()
  .use(authMiddleware)
  .get("/", async (ctx) => {
    const userId = ctx.get("userId");
    const user = await db.user.findById(userId);
    if (!user) throw new HTTPException(404, { message: "User not found" });

    return ctx.json({
      id: user.id,
      spotifyId: user.spotifyId,
      displayName: user.name,
      email: user.email,
      avatarUrl: user.image,
      createdAt: user.createdAt,
    });
  })
  .get(
    "/history",
    zValidator(
      "query",
      z.object({
        limit: z.coerce.number().min(1).max(200).default(50),
        before: z.coerce.date().optional(),
        after: z.coerce.date().optional(),
      }),
    ),
    async (ctx) => {
      const userId = ctx.get("userId");
      const { limit, before, after } = ctx.req.valid("query");

      const items = await db.history.findByUser(userId, {
        limit,
        before,
        after,
      });

      return ctx.json({ items });
    },
  )
  .get("/stats", async (ctx) => {
    const userId = ctx.get("userId");

    const [topTracks, topArtists] = await Promise.all([
      db.history.getTopTracks(userId),
      db.history.getTopArtists(userId),
    ]);

    return ctx.json({ topTracks, topArtists });
  });
