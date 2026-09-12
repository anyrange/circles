import { and, count, desc, eq, gte, inArray, or, sql } from "drizzle-orm";

import type { Database } from "../postgres";
import { albums, artists, audioFeatures, history, trackArtists, tracks } from "../postgres/schema";

export type Track = typeof tracks.$inferSelect;
export type NewTrack = typeof tracks.$inferInsert;
export type NewTrackArtist = typeof trackArtists.$inferInsert;
export type NewAudioFeatures = typeof audioFeatures.$inferInsert;

export class TrackModel {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async upsertMany(data: NewTrack[]) {
    if (data.length === 0) {
      return [];
    }

    return this.db
      .insert(tracks)
      .values(data)
      .onConflictDoUpdate({
        target: tracks.spotifyId,
        set: {
          name: tracks.name,
          durationMs: tracks.durationMs,
          explicit: tracks.explicit,
          popularity: tracks.popularity,
          albumId: tracks.albumId,
        },
      })
      .returning();
  }

  async upsertTrackArtists(data: NewTrackArtist[]) {
    if (data.length === 0) {
      return;
    }

    await this.db.insert(trackArtists).values(data).onConflictDoNothing();
  }

  async upsertAudioFeatures(data: NewAudioFeatures[]) {
    if (data.length === 0) {
      return;
    }

    await this.db
      .insert(audioFeatures)
      .values(data)
      .onConflictDoUpdate({
        target: audioFeatures.trackId,
        set: {
          danceability: audioFeatures.danceability,
          energy: audioFeatures.energy,
          key: audioFeatures.key,
          loudness: audioFeatures.loudness,
          mode: audioFeatures.mode,
          speechiness: audioFeatures.speechiness,
          acousticness: audioFeatures.acousticness,
          instrumentalness: audioFeatures.instrumentalness,
          liveness: audioFeatures.liveness,
          valence: audioFeatures.valence,
          tempo: audioFeatures.tempo,
          timeSignature: audioFeatures.timeSignature,
        },
      });
  }

  async findBySpotifyIds(spotifyIds: string[]) {
    if (spotifyIds.length === 0) {
      return [];
    }

    return this.db.select().from(tracks).where(inArray(tracks.spotifyId, spotifyIds));
  }

  async findDetailForUser(userId: string, trackId: string, since?: Date) {
    const playConditions = [eq(history.userId, userId)];
    if (since) {
      playConditions.push(gte(history.playedAt, since));
    }

    const [track] = await this.db
      .select({
        id: tracks.id,
        spotifyId: tracks.spotifyId,
        name: tracks.name,
        durationMs: tracks.durationMs,
        explicit: tracks.explicit,
        popularity: tracks.popularity,
        playCount: count(history.id),
        firstPlayedAt: sql<Date | null>`min(${history.playedAt})`,
        lastPlayedAt: sql<Date | null>`max(${history.playedAt})`,
        album: {
          id: albums.id,
          spotifyId: albums.spotifyId,
          name: albums.name,
          releaseDate: albums.releaseDate,
          imageUrl: sql<string | null>`${albums.images}->0->>'url'`,
        },
        audioFeatures: {
          danceability: audioFeatures.danceability,
          energy: audioFeatures.energy,
          valence: audioFeatures.valence,
          acousticness: audioFeatures.acousticness,
          instrumentalness: audioFeatures.instrumentalness,
          speechiness: audioFeatures.speechiness,
          liveness: audioFeatures.liveness,
          tempo: audioFeatures.tempo,
        },
      })
      .from(tracks)
      .leftJoin(albums, eq(tracks.albumId, albums.id))
      .leftJoin(audioFeatures, eq(audioFeatures.trackId, tracks.id))
      .leftJoin(history, and(eq(history.trackId, tracks.id), ...playConditions))
      .where(eq(tracks.id, trackId))
      .groupBy(
        tracks.id,
        tracks.spotifyId,
        tracks.name,
        tracks.durationMs,
        tracks.explicit,
        tracks.popularity,
        albums.id,
        albums.spotifyId,
        albums.name,
        albums.releaseDate,
        albums.images,
        audioFeatures.danceability,
        audioFeatures.energy,
        audioFeatures.valence,
        audioFeatures.acousticness,
        audioFeatures.instrumentalness,
        audioFeatures.speechiness,
        audioFeatures.liveness,
        audioFeatures.tempo,
      )
      .limit(1);

    if (!track) {
      return null;
    }

    const [trackArtistsList, recentPlays, scrobblesByYear] = await Promise.all([
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
        .where(eq(trackArtists.trackId, trackId))
        .groupBy(artists.id, artists.spotifyId, artists.name, artists.images)
        .orderBy(artists.name),
      this.db
        .select({ playedAt: history.playedAt })
        .from(history)
        .where(and(eq(history.trackId, trackId), ...playConditions))
        .orderBy(desc(history.playedAt))
        .limit(20),
      this.db.execute<{ year: string; count: string }>(sql`
        SELECT EXTRACT(YEAR FROM ${history.playedAt})::int AS year, count(*)::int AS count
        FROM ${history}
        WHERE ${history.userId} = ${userId}
          AND ${history.trackId} = ${trackId}
          ${since ? sql`AND ${history.playedAt} >= ${since}` : sql``}
        GROUP BY year
        ORDER BY year
      `),
    ]);

    return {
      track,
      artists: trackArtistsList,
      recentPlays,
      scrobblesByYear: scrobblesByYear.rows.map((row) => ({
        year: Number(row.year),
        count: Number(row.count),
      })),
    };
  }

  async getLibraryTracks(
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
        track: {
          id: tracks.id,
          spotifyId: tracks.spotifyId,
          name: tracks.name,
          durationMs: tracks.durationMs,
          explicit: tracks.explicit,
        },
        album: {
          id: albums.id,
          name: albums.name,
          imageUrl: sql<string | null>`${albums.images}->0->>'url'`,
        },
        playCount: count(history.id),
        artistNames: sql<string>`string_agg(distinct ${artists.name}, ', ' order by ${artists.name})`,
        lastPlayedAt: sql<Date | null>`max(${history.playedAt})`,
      })
      .from(history)
      .innerJoin(tracks, eq(history.trackId, tracks.id))
      .leftJoin(albums, eq(tracks.albumId, albums.id))
      .leftJoin(trackArtists, eq(trackArtists.trackId, tracks.id))
      .leftJoin(artists, eq(trackArtists.artistId, artists.id))
      .where(and(...conditions))
      .groupBy(
        tracks.id,
        tracks.spotifyId,
        tracks.name,
        tracks.durationMs,
        tracks.explicit,
        albums.id,
        albums.name,
        albums.images,
      );

    const filteredQuery = cursor
      ? baseQuery.having(
          or(
            sql`${count(history.id)} < ${cursor.playCount}`,
            sql`(${count(history.id)} = ${cursor.playCount} AND ${tracks.id} > ${cursor.id})`,
          ),
        )
      : baseQuery;

    const rows = await filteredQuery.orderBy(desc(count(history.id)), tracks.id).limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const lastItem = items.at(-1);

    const [{ totalCount }] = await this.db
      .select({ totalCount: sql<number>`count(distinct ${tracks.id})` })
      .from(history)
      .innerJoin(tracks, eq(history.trackId, tracks.id))
      .where(and(...conditions));

    return {
      items,
      totalCount: Number(totalCount ?? 0),
      hasMore,
      nextCursor:
        hasMore && lastItem ? { playCount: lastItem.playCount, id: lastItem.track.id } : null,
    };
  }
}
