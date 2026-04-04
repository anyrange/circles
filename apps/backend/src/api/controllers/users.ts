import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { db } from "../../db";
import { sinceFromRange } from "../../library/range";

export const usersController = new Hono()
  .get("/by-username/:username", async (ctx) => {
    const username = ctx.req.param("username");
    const user = await db.user.findByUsername(username);
    if (!user) throw new HTTPException(404, { message: "User not found" });

    if (!user.isPublic) {
      throw new HTTPException(403, { message: "Profile is private" });
    }

    return ctx.json({
      id: user.id,
      displayName: user.name,
      username: user.username,
      avatarUrl: user.image,
      bio: user.bio,
      createdAt: user.createdAt,
    });
  })
  .get("/:id", async (ctx) => {
    const id = ctx.req.param("id");

    const user = await db.user.findById(id);
    if (!user) throw new HTTPException(404, { message: "User not found" });

    if (!user.isPublic) {
      throw new HTTPException(403, { message: "Profile is private" });
    }

    return ctx.json({
      id: user.id,
      displayName: user.name,
      username: user.username,
      avatarUrl: user.image,
      bio: user.bio,
      createdAt: user.createdAt,
    });
  })
  .get(
    "/:id/stats/extended",
    zValidator(
      "query",
      z.object({ range: z.enum(["7d", "30d", "90d", "365d", "all"]).default("all") }),
    ),
    async (ctx) => {
      const id = ctx.req.param("id");
      const { range } = ctx.req.valid("query");

      const user = await db.user.findById(id);
      if (!user) throw new HTTPException(404, { message: "User not found" });
      if (!user.isPublic) throw new HTTPException(403, { message: "Profile is private" });

      const since = sinceFromRange(range);
      const extended = await db.history.getExtendedStats(id, since);
      return ctx.json(extended);
    },
  );
