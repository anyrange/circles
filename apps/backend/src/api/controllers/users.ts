import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { db } from "../../db";

export const usersController = new Hono().get("/:id", async (ctx) => {
  const id = ctx.req.param("id");

  const user = await db.user.findById(id);
  if (!user) throw new HTTPException(404, { message: "User not found" });

  return ctx.json({
    id: user.id,
    displayName: user.name,
    avatarUrl: user.image,
    createdAt: user.createdAt,
  });
});
