import { and, count, desc, eq, gte, inArray, or, sql } from "drizzle-orm";

import type { Database } from "../postgres";
import { albums, artists, history, savedTracks, trackArtists, tracks } from "../postgres/schema";

export type Album = typeof albums.$inferSelect;
export type NewAlbum = typeof albums.$inferInsert;

export class AlbumModel {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async upsertMany(data: NewAlbum[]) {
    if (data.length === 0) {
      return [];
    }

    return this.db
      .insert(albums)
      .values(data)
      .onConflictDoUpdate({
        target: albums.spotifyId,
        set: {
          name: albums.name,
          albumType: albums.albumType,
          totalTracks: sql`COALESCE(EXCLUDED.total_tracks, ${albums.totalTracks})`,
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

    return this.db.select().from(albums).where(inArray(albums.spotifyId, spotifyIds));
  }

  async findDetailForUser(userId: string, albumId: string, since?: Date) {
    const playConditions = [eq(history.userId, userId)];
    if (since) {
      playConditions.push(gte(history.playedAt, since));
    }
    const albumPlayConditions = [...playConditions, eq(tracks.albumId, albumId)];

    const [album] = await this.db
      .select({
        id: albums.id,
        spotifyId: albums.spotifyId,
        name: albums.name,
        albumType: albums.albumType,
        releaseDate: albums.releaseDate,
        images: albums.images,
        playCount: count(history.id),
        trackCount: sql<number>`count(distinct ${history.trackId})`,
        lastPlayedAt: sql<Date | null>`max(${history.playedAt})`,
      })
      .from(albums)
      .leftJoin(tracks, eq(tracks.albumId, albums.id))
      .leftJoin(history, and(eq(history.trackId, tracks.id), ...playConditions))
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

    const [albumArtists, albumTracks, recentPlays, scrobblesByYear] = await Promise.all([
      this.db
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
      this.db
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
        .leftJoin(history, and(eq(history.trackId, tracks.id), ...playConditions))
        .where(eq(tracks.albumId, albumId))
        .groupBy(tracks.id, tracks.spotifyId, tracks.name, tracks.durationMs, tracks.explicit)
        .orderBy(desc(count(history.id)), tracks.name),
      this.db
        .select({
          playedAt: history.playedAt,
          track: {
            id: tracks.id,
            name: tracks.name,
          },
        })
        .from(history)
        .innerJoin(tracks, eq(history.trackId, tracks.id))
        .where(and(...albumPlayConditions))
        .orderBy(desc(history.playedAt))
        .limit(12),
      this.db.execute<{ year: string; count: string }>(sql`
        SELECT EXTRACT(YEAR FROM ${history.playedAt})::int AS year, count(*)::int AS count
        FROM ${history}
        INNER JOIN ${tracks} ON ${history.trackId} = ${tracks.id}
        WHERE ${history.userId} = ${userId}
          AND ${tracks.albumId} = ${albumId}
          ${since ? sql`AND ${history.playedAt} >= ${since}` : sql``}
        GROUP BY year
        ORDER BY year
      `),
    ]);

    return {
      album,
      artists: albumArtists,
      tracks: albumTracks,
      recentPlays,
      scrobblesByYear: scrobblesByYear.rows.map((row) => ({
        year: Number(row.year),
        count: Number(row.count),
      })),
    };
  }

  async getLibraryAlbums(
    userId: string,
    opts: { since?: Date; limit?: number; cursor?: { playCount: number; id: string } } = {},
  ) {
    const { since, limit = 50, cursor } = opts;
    const conditions = [eq(history.userId, userId)];
    if (since) {
      conditions.push(gte(history.playedAt, since));
    }

    const baseQuery = this.db
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

    const [{ totalCount }] = await this.db
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

  async getPlatinumAlbums(userId: string, limit = 8) {
    return this.db
      .select({
        album: {
          id: albums.id,
          spotifyId: albums.spotifyId,
          name: albums.name,
          albumType: albums.albumType,
          totalTracks: albums.totalTracks,
          releaseDate: albums.releaseDate,
          images: albums.images,
        },
        artistNames: sql<string>`string_agg(distinct ${artists.name}, ', ' order by ${artists.name})`,
        completedAt: sql<Date>`max(${savedTracks.addedAt})`,
      })
      .from(savedTracks)
      .innerJoin(tracks, eq(savedTracks.trackId, tracks.id))
      .innerJoin(albums, eq(tracks.albumId, albums.id))
      .leftJoin(trackArtists, eq(trackArtists.trackId, tracks.id))
      .leftJoin(artists, eq(trackArtists.artistId, artists.id))
      .where(and(eq(savedTracks.userId, userId), sql`${albums.totalTracks} > 0`))
      .groupBy(
        albums.id,
        albums.spotifyId,
        albums.name,
        albums.albumType,
        albums.totalTracks,
        albums.releaseDate,
        albums.images,
      )
      .having(sql`count(distinct ${savedTracks.trackId}) = ${albums.totalTracks}`)
      .orderBy(desc(sql`max(${savedTracks.addedAt})`), albums.name)
      .limit(limit);
  }
}
