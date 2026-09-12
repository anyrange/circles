import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { db } from "../../db";
import type { AuthVariables } from "../middleware/auth";
import { authMiddleware } from "../middleware/auth";

export const playlistsController = new Hono<{ Variables: AuthVariables }>()
  .use(authMiddleware)
  .get("/me/playlists", async (ctx) => {
    const userId = ctx.get("userId");
    const lists = await db.playlist.findByUser(userId);
    return ctx.json({ playlists: lists });
  })
  .post(
    "/me/playlists",
    zValidator(
      "json",
      z.object({ name: z.string().min(1).max(500), description: z.string().optional() }),
    ),
    async (ctx) => {
      const userId = ctx.get("userId");
      const { name, description } = ctx.req.valid("json");
      const playlist = await db.playlist.create({ userId, name, description });
      return ctx.json(playlist, 201);
    },
  )
  .delete("/me/playlists/:id", async (ctx) => {
    const userId = ctx.get("userId");
    const id = ctx.req.param("id");

    const playlist = await db.playlist.findById(id, userId);
    if (!playlist) {
      throw new HTTPException(404, { message: "Playlist not found" });
    }

    await db.playlist.delete(id, userId);
    return ctx.json({ ok: true });
  })
  .get("/me/playlists/:id/tracks", async (ctx) => {
    const userId = ctx.get("userId");
    const id = ctx.req.param("id");

    const playlist = await db.playlist.findById(id, userId);
    if (!playlist) {
      throw new HTTPException(404, { message: "Playlist not found" });
    }

    const tracks = await db.playlist.getTracks(id);
    return ctx.json({ tracks });
  })
  .post(
    "/me/playlists/:id/tracks",
    zValidator("json", z.object({ trackId: z.string(), position: z.number().optional() })),
    async (ctx) => {
      const userId = ctx.get("userId");
      const id = ctx.req.param("id");
      const { trackId, position } = ctx.req.valid("json");

      const playlist = await db.playlist.findById(id, userId);
      if (!playlist) {
        throw new HTTPException(404, { message: "Playlist not found" });
      }

      await db.playlist.addTrack(id, trackId, position);
      return ctx.json({ ok: true }, 201);
    },
  )
  .delete("/me/playlists/:id/tracks/:trackId", async (ctx) => {
    const userId = ctx.get("userId");
    const id = ctx.req.param("id");
    const trackId = ctx.req.param("trackId");

    const playlist = await db.playlist.findById(id, userId);
    if (!playlist) {
      throw new HTTPException(404, { message: "Playlist not found" });
    }

    await db.playlist.removeTrack(id, trackId);
    return ctx.json({ ok: true });
  });
