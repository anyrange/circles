import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { db } from "../../db";
import { sinceFromRange } from "../../lib/range";
import { hydrateAndStoreArtistsForUser } from "../../lib/spotify-artists";
import type { AuthVariables } from "../middleware/auth";
import { authMiddleware } from "../middleware/auth";

const rangeSchema = z.enum(["7d", "30d", "90d", "365d", "all"]).default("all");

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
      username: user.username,
      isPublic: user.isPublic,
      bio: user.bio,
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

      const page = await db.history.findByUser(userId, {
        limit,
        before,
        after,
      });

      return ctx.json({
        items: page.items,
        hasMore: page.hasMore,
        nextCursor: page.nextCursor?.toISOString() ?? null,
      });
    },
  )
  .get("/stats", zValidator("query", z.object({ range: rangeSchema })), async (ctx) => {
    const userId = ctx.get("userId");
    const { range } = ctx.req.valid("query");
    const since = sinceFromRange(range);

    const [topTracks, topArtists] = await Promise.all([
      db.history.getTopTracks(userId, 10, since),
      db.history.getTopArtists(userId, 10, since),
    ]);

    const artistsMissingImages = topArtists
      .filter((item) => !item.artist.images?.length)
      .map((item) => ({
        id: item.artist.spotifyId,
        name: item.artist.name,
      }));

    if (artistsMissingImages.length === 0) {
      return ctx.json({ topTracks, topArtists });
    }

    const hydratedArtists = await hydrateAndStoreArtistsForUser(userId, artistsMissingImages);
    const hydratedArtistBySpotifyId = new Map(
      hydratedArtists.map((artist) => [artist.spotifyId, artist]),
    );

    return ctx.json({
      topTracks,
      topArtists: topArtists.map((item) => {
        const hydrated = hydratedArtistBySpotifyId.get(item.artist.spotifyId);
        if (!hydrated) {
          return item;
        }

        return {
          ...item,
          artist: {
            ...item.artist,
            images: hydrated.images,
            genres: hydrated.genres,
            popularity: hydrated.popularity,
          },
        };
      }),
    });
  })
  .get("/stats/extended", zValidator("query", z.object({ range: rangeSchema })), async (ctx) => {
    const userId = ctx.get("userId");
    const { range } = ctx.req.valid("query");
    const since = sinceFromRange(range);

    const extended = await db.history.getExtendedStats(userId, since);
    return ctx.json(extended);
  })
  .get(
    "/time-machine",
    zValidator(
      "query",
      z.object({
        month: z.coerce.number().min(1).max(12),
        day: z.coerce.number().min(1).max(31),
      }),
    ),
    async (ctx) => {
      const userId = ctx.get("userId");
      const { month, day } = ctx.req.valid("query");

      const results = await db.history.getTimeMachine(userId, month, day);
      return ctx.json(results);
    },
  );
