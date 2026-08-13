import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { db } from "../../db";
import { logger } from "../../library/logger";
import { sinceFromRange } from "../../library/range";
import { hydrateArtist } from "../../worker/workflows/hydrate-artist";
import type { AuthVariables } from "../middleware/auth";
import { authMiddleware } from "../middleware/auth";

const rangeSchema = z.enum(["7d", "30d", "90d", "365d", "all"]).default("all");
const pageSchema = z.object({
  range: rangeSchema,
  limit: z.coerce.number().min(1).max(100).default(50),
});

export const libraryController = new Hono<{ Variables: AuthVariables }>()
  .use(authMiddleware)
  .get("/library/overview", zValidator("query", z.object({ range: rangeSchema })), async (ctx) => {
    const userId = ctx.get("userId");
    const { range } = ctx.req.valid("query");
    const since = sinceFromRange(range);

    return ctx.json(await db.history.getLibraryOverview(userId, since));
  })
  .get(
    "/library/scrobbles",
    zValidator(
      "query",
      pageSchema.extend({
        cursor: z.coerce.date().optional(),
      }),
    ),
    async (ctx) => {
      const userId = ctx.get("userId");
      const { range, limit, cursor } = ctx.req.valid("query");
      const since = sinceFromRange(range);

      const page = await db.history.getLibraryScrobbles(userId, {
        limit,
        before: cursor,
        since,
      });

      return ctx.json({
        items: page.items,
        totalCount: page.totalCount,
        hasMore: page.hasMore,
        nextCursor: page.nextCursor?.toISOString() ?? null,
      });
    },
  )
  .get(
    "/library/artists",
    zValidator(
      "query",
      pageSchema.extend({
        cursorPlayCount: z.coerce.number().optional(),
        cursorId: z.string().optional(),
      }),
    ),
    async (ctx) => {
      const userId = ctx.get("userId");
      const { range, limit, cursorPlayCount, cursorId } = ctx.req.valid("query");
      const since = sinceFromRange(range);

      const page = await db.artist.getLibraryArtists(userId, {
        since,
        limit,
        cursor:
          cursorPlayCount !== undefined && cursorId
            ? { playCount: cursorPlayCount, id: cursorId }
            : undefined,
      });

      return ctx.json(page);
    },
  )
  .get(
    "/library/albums",
    zValidator(
      "query",
      pageSchema.extend({
        cursorPlayCount: z.coerce.number().optional(),
        cursorId: z.string().optional(),
      }),
    ),
    async (ctx) => {
      const userId = ctx.get("userId");
      const { range, limit, cursorPlayCount, cursorId } = ctx.req.valid("query");
      const since = sinceFromRange(range);

      const page = await db.album.getLibraryAlbums(userId, {
        since,
        limit,
        cursor:
          cursorPlayCount !== undefined && cursorId
            ? { playCount: cursorPlayCount, id: cursorId }
            : undefined,
      });

      return ctx.json(page);
    },
  )
  .get(
    "/library/tracks",
    zValidator(
      "query",
      pageSchema.extend({
        cursorPlayCount: z.coerce.number().optional(),
        cursorId: z.string().optional(),
      }),
    ),
    async (ctx) => {
      const userId = ctx.get("userId");
      const { range, limit, cursorPlayCount, cursorId } = ctx.req.valid("query");
      const since = sinceFromRange(range);

      const page = await db.track.getLibraryTracks(userId, {
        since,
        limit,
        cursor:
          cursorPlayCount !== undefined && cursorId
            ? { playCount: cursorPlayCount, id: cursorId }
            : undefined,
      });

      return ctx.json(page);
    },
  )
  .get("/artists/:id", zValidator("query", z.object({ range: rangeSchema })), async (ctx) => {
    const userId = ctx.get("userId");
    const id = ctx.req.param("id");
    const since = sinceFromRange(ctx.req.valid("query").range);

    const detail = await db.artist.findDetailForUser(userId, id, since);
    if (!detail) {
      throw new HTTPException(404, { message: "Artist not found" });
    }

    const shouldHydrate =
      detail.artist.images === null &&
      detail.artist.genres === null &&
      detail.artist.popularity === null;

    if (shouldHydrate) {
      hydrateArtist.runNoWait({ userId, artistId: id }).catch((err) => {
        logger.api.warn({ err, artistId: id, userId }, "failed to enqueue artist hydration");
      });
    }

    return ctx.json({
      ...detail,
      isHydrating: shouldHydrate,
    });
  })
  .get("/albums/:id", zValidator("query", z.object({ range: rangeSchema })), async (ctx) => {
    const userId = ctx.get("userId");
    const id = ctx.req.param("id");
    const since = sinceFromRange(ctx.req.valid("query").range);

    const detail = await db.album.findDetailForUser(userId, id, since);
    if (!detail) {
      throw new HTTPException(404, { message: "Album not found" });
    }

    return ctx.json(detail);
  })
  .get("/tracks/:id", zValidator("query", z.object({ range: rangeSchema })), async (ctx) => {
    const userId = ctx.get("userId");
    const id = ctx.req.param("id");
    const since = sinceFromRange(ctx.req.valid("query").range);

    const detail = await db.track.findDetailForUser(userId, id, since);
    if (!detail) {
      throw new HTTPException(404, { message: "Track not found" });
    }

    return ctx.json(detail);
  });
