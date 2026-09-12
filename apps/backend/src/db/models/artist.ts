import { and, count, desc, eq, gte, inArray, or, sql } from "drizzle-orm";

import type { Database } from "../postgres";
import { albums, artists, history, trackArtists, tracks } from "../postgres/schema";

export type Artist = typeof artists.$inferSelect;
export type NewArtist = typeof artists.$inferInsert;

export class ArtistModel {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async upsertMany(data: NewArtist[]) {
    if (data.length === 0) {
      return [];
    }

    return this.db
      .insert(artists)
      .values(data)
      .onConflictDoUpdate({
        target: artists.spotifyId,
        set: {
          name: artists.name,
          genres: sql`COALESCE(EXCLUDED.genres, ${artists.genres})`,
          images: sql`COALESCE(EXCLUDED.images, ${artists.images})`,
          popularity: sql`COALESCE(EXCLUDED.popularity, ${artists.popularity})`,
        },
      })
      .returning();
  }

  async findBySpotifyIds(spotifyIds: string[]) {
    if (spotifyIds.length === 0) {
      return [];
    }

    return this.db.select().from(artists).where(inArray(artists.spotifyId, spotifyIds));
  }

  async findDetailForUser(userId: string, artistId: string, since?: Date) {
    const playConditions = [eq(history.userId, userId)];
    if (since) {
      playConditions.push(gte(history.playedAt, since));
    }
    const artistPlayConditions = [...playConditions, eq(trackArtists.artistId, artistId)];

    const [artist] = await this.db
      .select({
        id: artists.id,
        spotifyId: artists.spotifyId,
        name: artists.name,
        genres: artists.genres,
        images: artists.images,
        popularity: artists.popularity,
        playCount: count(history.id),
        trackCount: sql<number>`count(distinct ${history.trackId})`,
        albumCount: sql<number>`count(distinct case when ${history.id} is not null then ${albums.id} end)`,
        lastPlayedAt: sql<Date | null>`max(${history.playedAt})`,
      })
      .from(artists)
      .leftJoin(trackArtists, eq(trackArtists.artistId, artists.id))
      .leftJoin(tracks, eq(trackArtists.trackId, tracks.id))
      .leftJoin(albums, eq(tracks.albumId, albums.id))
      .leftJoin(history, and(eq(history.trackId, tracks.id), ...playConditions))
      .where(eq(artists.id, artistId))
      .groupBy(
        artists.id,
        artists.spotifyId,
        artists.name,
        artists.genres,
        artists.images,
        artists.popularity,
      )
      .limit(1);

    if (!artist) {
      return null;
    }

    const [topTracks, albumsByArtist, recentPlays, scrobblesByYear] = await Promise.all([
      this.db
        .select({
          trackId: tracks.id,
          trackSpotifyId: tracks.spotifyId,
          trackName: tracks.name,
          trackDurationMs: tracks.durationMs,
          albumId: albums.id,
          albumName: albums.name,
          albumImageUrl: sql<string | null>`${albums.images}->0->>'url'`,
          playCount: count(history.id),
        })
        .from(history)
        .innerJoin(tracks, eq(history.trackId, tracks.id))
        .innerJoin(trackArtists, eq(trackArtists.trackId, tracks.id))
        .leftJoin(albums, eq(tracks.albumId, albums.id))
        .where(and(...artistPlayConditions))
        .groupBy(
          tracks.id,
          tracks.spotifyId,
          tracks.name,
          tracks.durationMs,
          albums.id,
          albums.name,
          albums.images,
        )
        .orderBy(desc(count(history.id)), tracks.name)
        .limit(10)
        .then((rows) =>
          rows.map((row) => ({
            track: {
              id: row.trackId,
              spotifyId: row.trackSpotifyId,
              name: row.trackName,
              durationMs: row.trackDurationMs,
              album: row.albumId
                ? {
                    id: row.albumId,
                    name: row.albumName,
                    imageUrl: row.albumImageUrl,
                  }
                : null,
            },
            playCount: row.playCount,
          })),
        ),
      this.db
        .select({
          album: {
            id: albums.id,
            spotifyId: albums.spotifyId,
            name: albums.name,
            albumType: albums.albumType,
            releaseDate: albums.releaseDate,
            imageUrl: sql<string | null>`${albums.images}->0->>'url'`,
          },
          playCount: count(history.id),
          trackCount: sql<number>`count(distinct ${tracks.id})`,
        })
        .from(history)
        .innerJoin(tracks, eq(history.trackId, tracks.id))
        .innerJoin(trackArtists, eq(trackArtists.trackId, tracks.id))
        .innerJoin(albums, eq(tracks.albumId, albums.id))
        .where(and(...artistPlayConditions))
        .groupBy(
          albums.id,
          albums.spotifyId,
          albums.name,
          albums.albumType,
          albums.releaseDate,
          albums.images,
        )
        .orderBy(desc(count(history.id)), albums.releaseDate, albums.name)
        .limit(12),
      this.db
        .select({
          playedAt: history.playedAt,
          track: {
            id: tracks.id,
            name: tracks.name,
            albumImageUrl: sql<string | null>`${albums.images}->0->>'url'`,
          },
        })
        .from(history)
        .innerJoin(tracks, eq(history.trackId, tracks.id))
        .innerJoin(trackArtists, eq(trackArtists.trackId, tracks.id))
        .leftJoin(albums, eq(tracks.albumId, albums.id))
        .where(and(...artistPlayConditions))
        .orderBy(desc(history.playedAt))
        .limit(12),
      this.db.execute<{ year: string; count: string }>(sql`
        SELECT EXTRACT(YEAR FROM ${history.playedAt})::int AS year, count(*)::int AS count
        FROM ${history}
        INNER JOIN ${tracks} ON ${history.trackId} = ${tracks.id}
        INNER JOIN ${trackArtists} ON ${tracks.id} = ${trackArtists.trackId}
        WHERE ${history.userId} = ${userId}
          AND ${trackArtists.artistId} = ${artistId}
          ${since ? sql`AND ${history.playedAt} >= ${since}` : sql``}
        GROUP BY year
        ORDER BY year
      `),
    ]);

    return {
      artist,
      topTracks,
      albums: albumsByArtist,
      recentPlays,
      scrobblesByYear: scrobblesByYear.rows.map((row) => ({
        year: Number(row.year),
        count: Number(row.count),
      })),
    };
  }

  async getLibraryArtists(
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
        artist: {
          id: artists.id,
          spotifyId: artists.spotifyId,
          name: artists.name,
          images: artists.images,
        },
        playCount: count(history.id),
        trackCount: sql<number>`count(distinct ${tracks.id})`,
        albumCount: sql<number>`count(distinct ${albums.id})`,
        lastPlayedAt: sql<Date | null>`max(${history.playedAt})`,
      })
      .from(history)
      .innerJoin(tracks, eq(history.trackId, tracks.id))
      .innerJoin(trackArtists, eq(trackArtists.trackId, tracks.id))
      .innerJoin(artists, eq(trackArtists.artistId, artists.id))
      .leftJoin(albums, eq(tracks.albumId, albums.id))
      .where(and(...conditions))
      .groupBy(artists.id, artists.spotifyId, artists.name, artists.images);

    const filteredQuery = cursor
      ? baseQuery.having(
          or(
            sql`${count(history.id)} < ${cursor.playCount}`,
            sql`(${count(history.id)} = ${cursor.playCount} AND ${artists.id} > ${cursor.id})`,
          ),
        )
      : baseQuery;

    const rows = await filteredQuery.orderBy(desc(count(history.id)), artists.id).limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const lastItem = items.at(-1);

    const [{ totalCount }] = await this.db
      .select({ totalCount: sql<number>`count(distinct ${artists.id})` })
      .from(history)
      .innerJoin(tracks, eq(history.trackId, tracks.id))
      .innerJoin(trackArtists, eq(trackArtists.trackId, tracks.id))
      .innerJoin(artists, eq(trackArtists.artistId, artists.id))
      .where(and(...conditions));

    return {
      items,
      totalCount: Number(totalCount ?? 0),
      hasMore,
      nextCursor:
        hasMore && lastItem ? { playCount: lastItem.playCount, id: lastItem.artist.id } : null,
    };
  }
}
