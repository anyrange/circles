import { desc, eq, inArray, sql } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { db } from "../../db";
import { db as drizzleDb } from "../../db/postgres";
import { history, tracks, user } from "../../db/postgres/schema";
import { authMiddleware } from "../middleware/auth";
import type { AuthVariables } from "../middleware/auth";

export const socialController = new Hono<{ Variables: AuthVariables }>()
  .use(authMiddleware)
  .post("/me/follows/:userId", async (ctx) => {
    const currentUserId = ctx.get("userId");
    const targetUserId = ctx.req.param("userId");

    if (currentUserId === targetUserId) {
      throw new HTTPException(400, { message: "Cannot follow yourself" });
    }

    const target = await db.user.findById(targetUserId);
    if (!target) throw new HTTPException(404, { message: "User not found" });

    await db.follows.follow(currentUserId, targetUserId);
    return ctx.json({ ok: true });
  })
  .delete("/me/follows/:userId", async (ctx) => {
    const currentUserId = ctx.get("userId");
    const targetUserId = ctx.req.param("userId");

    await db.follows.unfollow(currentUserId, targetUserId);
    return ctx.json({ ok: true });
  })
  .get("/me/follows", async (ctx) => {
    const userId = ctx.get("userId");

    const [following, followers] = await Promise.all([
      db.follows.getFollowing(userId),
      db.follows.getFollowers(userId),
    ]);

    return ctx.json({ following, followers });
  })
  .get("/me/following-activity", async (ctx) => {
    const userId = ctx.get("userId");

    const following = await db.follows.getFollowing(userId);
    if (following.length === 0) {
      return ctx.json({ plays: [] });
    }

    const followingIds = following.map((f) => f.id);

    const plays = await drizzleDb
      .select({
        playedAt: history.playedAt,
        userId: history.userId,
        track: {
          id: tracks.id,
          spotifyId: tracks.spotifyId,
          name: tracks.name,
        },
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          image: user.image,
        },
      })
      .from(history)
      .innerJoin(tracks, eq(history.trackId, tracks.id))
      .innerJoin(user, eq(history.userId, user.id))
      .where(inArray(history.userId, followingIds))
      .orderBy(desc(history.playedAt))
      .limit(50);

    return ctx.json({ plays });
  })
  .get("/me/music-matches", async (ctx) => {
    const userId = ctx.get("userId");

    // Find users with overlapping top artists
    const matches = await drizzleDb.execute<{
      id: string;
      name: string;
      username: string | null;
      image: string | null;
      shared_count: string;
    }>(sql`
      WITH my_top_artists AS (
        SELECT ta.artist_id, count(*) as plays
        FROM ${history} h
        JOIN ${tracks} t ON h.track_id = t.id
        JOIN (SELECT * FROM track_artists) ta ON t.id = ta.track_id
        WHERE h.user_id = ${userId}
        GROUP BY ta.artist_id
        ORDER BY plays DESC
        LIMIT 20
      ),
      other_top_artists AS (
        SELECT h.user_id, ta.artist_id, count(*) as plays
        FROM ${history} h
        JOIN ${tracks} t ON h.track_id = t.id
        JOIN (SELECT * FROM track_artists) ta ON t.id = ta.track_id
        WHERE h.user_id != ${userId}
        GROUP BY h.user_id, ta.artist_id
      )
      SELECT
        u.id, u.name, u.username, u.image,
        count(DISTINCT ota.artist_id)::int as shared_count
      FROM other_top_artists ota
      JOIN my_top_artists mta ON ota.artist_id = mta.artist_id
      JOIN "user" u ON ota.user_id = u.id
      WHERE u.is_public = true
      GROUP BY u.id, u.name, u.username, u.image
      ORDER BY shared_count DESC
      LIMIT 10
    `);

    return ctx.json({
      matches: matches.rows.map((m) => ({
        ...m,
        sharedCount: Number(m.shared_count),
      })),
    });
  });
