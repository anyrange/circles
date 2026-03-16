import { and, count, desc, eq, gte, inArray, or, sql } from "drizzle-orm";

import { db } from "../postgres";
import { albums, artists, history, trackArtists, tracks } from "../postgres/schema";

export type Album = typeof albums.$inferSelect;
export type NewAlbum = typeof albums.$inferInsert;

export class AlbumModel {
  async upsertMany(data: NewAlbum[]) {
    if (data.length === 0) {
      return [];
    }

    return db
      .insert(albums)
      .values(data)
      .onConflictDoUpdate({
        target: albums.spotifyId,
        set: {
          name: albums.name,
          albumType: albums.albumType,
          releaseDate: albums.releaseDate,
          images: albums.images,
        },
      })
      .returning();
  }

  async findBySpotifyIds(spotifyIds: string[]) {
    if (spotifyIds.length === 0) {
      return [];
    }

    return db.select().from(albums).where(inArray(albums.spotifyId, spotifyIds));
  }

  async findDetailForUser(userId: string, albumId: string) {
    const [album] = await db
      .select({
        id: albums.id,
        spotifyId: albums.spotifyId,
        name: albums.name,
        albumType: albums.albumType,
        releaseDate: albums.releaseDate,
        images: albums.images,
        playCount: count(history.id),
        trackCount: sql<number>`count(distinct ${tracks.id})`,
        lastPlayedAt: sql<Date | null>`max(${history.playedAt})`,
      })
      .from(albums)
      .leftJoin(tracks, eq(tracks.albumId, albums.id))
      .leftJoin(history, and(eq(history.trackId, tracks.id), eq(history.userId, userId)))
      .where(eq(albums.id, albumId))
      .groupBy(
        albums.id,
        albums.spotifyId,
        albums.name,
        albums.albumType,
        albums.releaseDate,
        albums.images,
      )
      .limit(1);

    if (!album) {
      return null;
    }

    const [albumArtists, albumTracks, recentPlays] = await Promise.all([
      db
        .select({
          artist: {
            id: artists.id,
            spotifyId: artists.spotifyId,
            name: artists.name,
            images: artists.images,
          },
        })
        .from(trackArtists)
        .innerJoin(artists, eq(trackArtists.artistId, artists.id))
        .innerJoin(tracks, eq(trackArtists.trackId, tracks.id))
        .where(eq(tracks.albumId, albumId))
        .groupBy(artists.id, artists.spotifyId, artists.name, artists.images)
        .orderBy(artists.name),
      db
        .select({
          track: {
            id: tracks.id,
            spotifyId: tracks.spotifyId,
            name: tracks.name,
            durationMs: tracks.durationMs,
            explicit: tracks.explicit,
          },
          playCount: count(history.id),
        })
        .from(tracks)
        .leftJoin(history, and(eq(history.trackId, tracks.id), eq(history.userId, userId)))
        .where(eq(tracks.albumId, albumId))
        .groupBy(tracks.id, tracks.spotifyId, tracks.name, tracks.durationMs, tracks.explicit)
        .orderBy(desc(count(history.id)), tracks.name),
      db
        .select({
          playedAt: history.playedAt,
          track: {
            id: tracks.id,
            name: tracks.name,
          },
        })
        .from(history)
        .innerJoin(tracks, eq(history.trackId, tracks.id))
        .where(and(eq(history.userId, userId), eq(tracks.albumId, albumId)))
        .orderBy(desc(history.playedAt))
        .limit(12),
    ]);

    return {
      album,
      artists: albumArtists,
      tracks: albumTracks,
      recentPlays,
    };
  }

  async getLibraryAlbums(
    userId: string,
    opts: { since?: Date; limit?: number; cursor?: { playCount: number; id: string } } = {},
  ) {
    const { since, limit = 50, cursor } = opts;
    const conditions = [eq(history.userId, userId)];
    if (since) conditions.push(gte(history.playedAt, since));

    const baseQuery = db
      .select({
        album: {
          id: albums.id,
          spotifyId: albums.spotifyId,
          name: albums.name,
          albumType: albums.albumType,
          releaseDate: albums.releaseDate,
          images: albums.images,
        },
        artistNames: sql<string>`string_agg(distinct ${artists.name}, ', ' order by ${artists.name})`,
        playCount: count(history.id),
        trackCount: sql<number>`count(distinct ${tracks.id})`,
        lastPlayedAt: sql<Date | null>`max(${history.playedAt})`,
      })
      .from(history)
      .innerJoin(tracks, eq(history.trackId, tracks.id))
      .innerJoin(albums, eq(tracks.albumId, albums.id))
      .leftJoin(trackArtists, eq(trackArtists.trackId, tracks.id))
      .leftJoin(artists, eq(trackArtists.artistId, artists.id))
      .where(and(...conditions))
      .groupBy(
        albums.id,
        albums.spotifyId,
        albums.name,
        albums.albumType,
        albums.releaseDate,
        albums.images,
      );

    const filteredQuery = cursor
      ? baseQuery.having(
          or(
            sql`${count(history.id)} < ${cursor.playCount}`,
            sql`(${count(history.id)} = ${cursor.playCount} AND ${albums.id} > ${cursor.id})`,
          ),
        )
      : baseQuery;

    const rows = await filteredQuery.orderBy(desc(count(history.id)), albums.id).limit(limit + 1);
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const lastItem = items.at(-1);

    const [{ totalCount }] = await db
      .select({ totalCount: sql<number>`count(distinct ${albums.id})` })
      .from(history)
      .innerJoin(tracks, eq(history.trackId, tracks.id))
      .innerJoin(albums, eq(tracks.albumId, albums.id))
      .where(and(...conditions));

    return {
      items,
      totalCount: Number(totalCount ?? 0),
      hasMore,
      nextCursor:
        hasMore && lastItem ? { playCount: lastItem.playCount, id: lastItem.album.id } : null,
    };
  }
}
