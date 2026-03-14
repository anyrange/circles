import { and, count, desc, eq, gte, lt } from "drizzle-orm";

import { db } from "../postgres";
import { artists, history, trackArtists, tracks } from "../postgres/schema";

export type History = typeof history.$inferSelect;
export type NewHistory = typeof history.$inferInsert;

export class HistoryModel {
  async insertMany(data: NewHistory[]) {
    if (data.length === 0) {
      return;
    }

    await db.insert(history).values(data).onConflictDoNothing();
  }

  async findByUser(userId: string, opts: { limit?: number; before?: Date; after?: Date } = {}) {
    const { limit = 50, before, after } = opts;
    const conditions = [eq(history.userId, userId)];
    if (before) conditions.push(lt(history.playedAt, before));
    if (after) conditions.push(gte(history.playedAt, after));

    return db
      .select({
        playedAt: history.playedAt,
        track: {
          id: tracks.id,
          spotifyId: tracks.spotifyId,
          name: tracks.name,
          durationMs: tracks.durationMs,
          explicit: tracks.explicit,
        },
      })
      .from(history)
      .innerJoin(tracks, eq(history.trackId, tracks.id))
      .where(and(...conditions))
      .orderBy(desc(history.playedAt))
      .limit(limit);
  }

  async getLatestPlayedAt(userId: string) {
    const [row] = await db
      .select({ playedAt: history.playedAt })
      .from(history)
      .where(eq(history.userId, userId))
      .orderBy(desc(history.playedAt))
      .limit(1);
    return row?.playedAt ?? null;
  }

  async getTopTracks(userId: string, limit = 10) {
    return db
      .select({
        track: {
          id: tracks.id,
          spotifyId: tracks.spotifyId,
          name: tracks.name,
        },
        playCount: count(history.id),
      })
      .from(history)
      .innerJoin(tracks, eq(history.trackId, tracks.id))
      .where(eq(history.userId, userId))
      .groupBy(tracks.id, tracks.spotifyId, tracks.name)
      .orderBy(desc(count(history.id)))
      .limit(limit);
  }

  async getTopArtists(userId: string, limit = 10) {
    return db
      .select({
        artist: {
          id: artists.id,
          spotifyId: artists.spotifyId,
          name: artists.name,
          images: artists.images,
        },
        playCount: count(history.id),
      })
      .from(history)
      .innerJoin(tracks, eq(history.trackId, tracks.id))
      .innerJoin(trackArtists, eq(tracks.id, trackArtists.trackId))
      .innerJoin(artists, eq(trackArtists.artistId, artists.id))
      .where(eq(history.userId, userId))
      .groupBy(artists.id, artists.spotifyId, artists.name, artists.images)
      .orderBy(desc(count(history.id)))
      .limit(limit);
  }
}
