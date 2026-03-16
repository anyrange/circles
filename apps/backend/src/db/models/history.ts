import { and, avg, count, desc, eq, gte, inArray, sql } from "drizzle-orm";

import { db } from "../postgres";
import { albums, artists, audioFeatures, history, trackArtists, tracks } from "../postgres/schema";

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
    if (before) conditions.push(sql`${history.playedAt} < ${before}`);
    if (after) conditions.push(gte(history.playedAt, after));

    const pageRows = await db
      .select({
        playedAt: history.playedAt,
        trackId: history.trackId,
        track: {
          id: tracks.id,
          spotifyId: tracks.spotifyId,
          name: tracks.name,
          durationMs: tracks.durationMs,
          explicit: tracks.explicit,
          albumImageUrl: sql<string | null>`${albums.images}->0->>'url'`,
        },
      })
      .from(history)
      .innerJoin(tracks, eq(history.trackId, tracks.id))
      .leftJoin(albums, eq(tracks.albumId, albums.id))
      .where(and(...conditions))
      .orderBy(desc(history.playedAt))
      .limit(limit + 1);

    const hasMore = pageRows.length > limit;
    const visibleRows = hasMore ? pageRows.slice(0, limit) : pageRows;
    const trackIds = [...new Set(visibleRows.map((row) => row.trackId))];

    const artistRows =
      trackIds.length > 0
        ? await db
            .select({
              trackId: trackArtists.trackId,
              artistId: artists.id,
              artistName: artists.name,
            })
            .from(trackArtists)
            .innerJoin(artists, eq(trackArtists.artistId, artists.id))
            .where(inArray(trackArtists.trackId, trackIds))
        : [];

    const artistsByTrackId = new Map<string, { id: string; name: string }[]>();
    for (const row of artistRows) {
      const existing = artistsByTrackId.get(row.trackId) ?? [];
      existing.push({ id: row.artistId, name: row.artistName });
      artistsByTrackId.set(row.trackId, existing);
    }

    const items = visibleRows.map((row) => ({
      playedAt: row.playedAt,
      track: {
        id: row.track.id,
        spotifyId: row.track.spotifyId,
        name: row.track.name,
        durationMs: row.track.durationMs,
        explicit: row.track.explicit,
        albumImageUrl: row.track.albumImageUrl,
        artists: artistsByTrackId.get(row.trackId) ?? [],
      },
    }));

    return {
      items,
      hasMore,
      nextCursor: hasMore ? (items.at(-1)?.playedAt ?? null) : null,
    };
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

  async getLibraryOverview(userId: string, since?: Date) {
    const conditions = [eq(history.userId, userId)];
    if (since) conditions.push(gte(history.playedAt, since));

    const [totals, scrobblesByYear] = await Promise.all([
      db
        .select({
          totalScrobbles: count(history.id),
          totalArtists: sql<number>`count(distinct ${trackArtists.artistId})`,
          totalAlbums: sql<number>`count(distinct ${tracks.albumId})`,
          totalTracks: sql<number>`count(distinct ${history.trackId})`,
        })
        .from(history)
        .innerJoin(tracks, eq(history.trackId, tracks.id))
        .leftJoin(trackArtists, eq(trackArtists.trackId, tracks.id))
        .where(and(...conditions)),
      db.execute<{ year: string; count: string }>(sql`
        SELECT EXTRACT(YEAR FROM ${history.playedAt})::int as year, count(*)::int as count
        FROM ${history}
        WHERE ${history.userId} = ${userId}
        ${since ? sql`AND ${history.playedAt} >= ${since}` : sql``}
        GROUP BY year
        ORDER BY year
      `),
    ]);

    const totalScrobbles = Number(totals[0]?.totalScrobbles ?? 0);
    const firstScrobble = await db
      .select({ playedAt: history.playedAt })
      .from(history)
      .where(and(...conditions))
      .orderBy(history.playedAt)
      .limit(1);

    const lastScrobble = await db
      .select({ playedAt: history.playedAt })
      .from(history)
      .where(and(...conditions))
      .orderBy(desc(history.playedAt))
      .limit(1);

    let averagePerDay = 0;
    if (totalScrobbles > 0 && firstScrobble[0]?.playedAt && lastScrobble[0]?.playedAt) {
      const spanMs = lastScrobble[0].playedAt.getTime() - firstScrobble[0].playedAt.getTime();
      const days = Math.max(1, Math.ceil(spanMs / 86_400_000) + 1);
      averagePerDay = Math.round(totalScrobbles / days);
    }

    return {
      totalScrobbles,
      totalArtists: Number(totals[0]?.totalArtists ?? 0),
      totalAlbums: Number(totals[0]?.totalAlbums ?? 0),
      totalTracks: Number(totals[0]?.totalTracks ?? 0),
      averagePerDay,
      scrobblesByYear: scrobblesByYear.rows.map((row) => ({
        year: Number(row.year),
        count: Number(row.count),
      })),
    };
  }

  async getLibraryScrobbles(
    userId: string,
    opts: { limit?: number; before?: Date; since?: Date } = {},
  ) {
    const { limit = 50, before, since } = opts;
    const totalConditions = [eq(history.userId, userId)];
    if (since) totalConditions.push(gte(history.playedAt, since));

    const page = await this.findByUser(userId, { limit, before, after: since });
    const [{ totalCount }] = await db
      .select({ totalCount: count(history.id) })
      .from(history)
      .where(and(...totalConditions));

    return {
      ...page,
      totalCount: Number(totalCount ?? 0),
    };
  }

  async getTopTracks(userId: string, limit = 10, since?: Date) {
    const conditions = [eq(history.userId, userId)];
    if (since) conditions.push(gte(history.playedAt, since));

    return db
      .select({
        track: {
          id: tracks.id,
          spotifyId: tracks.spotifyId,
          name: tracks.name,
          albumImageUrl: sql<string | null>`${albums.images}->0->>'url'`,
        },
        playCount: count(history.id),
      })
      .from(history)
      .innerJoin(tracks, eq(history.trackId, tracks.id))
      .leftJoin(albums, eq(tracks.albumId, albums.id))
      .where(and(...conditions))
      .groupBy(tracks.id, tracks.spotifyId, tracks.name, albums.images)
      .orderBy(desc(count(history.id)))
      .limit(limit);
  }

  async getTopArtists(userId: string, limit = 10, since?: Date) {
    const conditions = [eq(history.userId, userId)];
    if (since) conditions.push(gte(history.playedAt, since));

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
      .where(and(...conditions))
      .groupBy(artists.id, artists.spotifyId, artists.name, artists.images)
      .orderBy(desc(count(history.id)))
      .limit(limit);
  }

  async getExtendedStats(userId: string, since?: Date) {
    const conditions = [eq(history.userId, userId)];
    if (since) conditions.push(gte(history.playedAt, since));
    const whereClause = and(...conditions);

    // Total scrobbles + listening time + mainstream score
    const [totals] = await db
      .select({
        totalScrobbles: count(history.id),
        totalListeningMs: sql<number>`coalesce(sum(${tracks.durationMs}), 0)`,
        mainstreamScore: sql<number>`coalesce(avg(${tracks.popularity}), 0)`,
      })
      .from(history)
      .innerJoin(tracks, eq(history.trackId, tracks.id))
      .where(whereClause);

    // Audio features averages
    const [features] = await db
      .select({
        energy: avg(audioFeatures.energy),
        valence: avg(audioFeatures.valence),
        danceability: avg(audioFeatures.danceability),
        acousticness: avg(audioFeatures.acousticness),
        instrumentalness: avg(audioFeatures.instrumentalness),
        tempo: avg(audioFeatures.tempo),
      })
      .from(history)
      .innerJoin(tracks, eq(history.trackId, tracks.id))
      .innerJoin(audioFeatures, eq(tracks.id, audioFeatures.trackId))
      .where(whereClause);

    // Top genres via jsonb_array_elements_text
    const genreRows = await db.execute<{ genre: string; count: string }>(sql`
      SELECT genre, count(*)::int as count
      FROM ${history}
      JOIN ${tracks} ON ${history.trackId} = ${tracks.id}
      JOIN ${trackArtists} ON ${tracks.id} = ${trackArtists.trackId}
      JOIN ${artists} ON ${trackArtists.artistId} = ${artists.id}
      CROSS JOIN LATERAL jsonb_array_elements_text(${artists.genres}) AS genre
      WHERE ${history.userId} = ${userId}
      ${since ? sql`AND ${history.playedAt} >= ${since}` : sql``}
      GROUP BY genre
      ORDER BY count DESC
      LIMIT 10
    `);

    // Scrobbles by hour
    const hourRows = await db.execute<{ hour: string; count: string }>(sql`
      SELECT EXTRACT(HOUR FROM ${history.playedAt})::int as hour, count(*)::int as count
      FROM ${history}
      WHERE ${history.userId} = ${userId}
      ${since ? sql`AND ${history.playedAt} >= ${since}` : sql``}
      GROUP BY hour
      ORDER BY hour
    `);

    // Scrobbles by day of week (0=Sun, 6=Sat)
    const dowRows = await db.execute<{ dow: string; count: string }>(sql`
      SELECT EXTRACT(DOW FROM ${history.playedAt})::int as dow, count(*)::int as count
      FROM ${history}
      WHERE ${history.userId} = ${userId}
      ${since ? sql`AND ${history.playedAt} >= ${since}` : sql``}
      GROUP BY dow
      ORDER BY dow
    `);

    // Scrobbles by date
    const dateRows = await db.execute<{ date: string; count: string }>(sql`
      SELECT DATE(${history.playedAt}) as date, count(*)::int as count
      FROM ${history}
      WHERE ${history.userId} = ${userId}
      ${since ? sql`AND ${history.playedAt} >= ${since}` : sql``}
      GROUP BY date
      ORDER BY date
    `);

    return {
      totalScrobbles: Number(totals?.totalScrobbles ?? 0),
      totalListeningMs: Number(totals?.totalListeningMs ?? 0),
      mainstreamScore: Math.round(Number(totals?.mainstreamScore ?? 0)),
      audioFeatures: features
        ? {
            energy: Number(features.energy ?? 0),
            valence: Number(features.valence ?? 0),
            danceability: Number(features.danceability ?? 0),
            acousticness: Number(features.acousticness ?? 0),
            instrumentalness: Number(features.instrumentalness ?? 0),
            tempo: Number(features.tempo ?? 0),
          }
        : null,
      topGenres: genreRows.rows.map((r) => ({ genre: r.genre, count: Number(r.count) })),
      scrobblesByHour: hourRows.rows.map((r) => ({ hour: Number(r.hour), count: Number(r.count) })),
      scrobblesByDayOfWeek: dowRows.rows.map((r) => ({
        dow: Number(r.dow),
        count: Number(r.count),
      })),
      scrobblesByDate: dateRows.rows.map((r) => ({ date: r.date, count: Number(r.count) })),
    };
  }

  async getTimeMachine(userId: string, month: number, day: number) {
    const rows = await db.execute<{
      year: string;
      played_at: string;
      track_id: string;
      spotify_id: string;
      name: string;
      duration_ms: number | null;
    }>(sql`
      SELECT
        EXTRACT(YEAR FROM ${history.playedAt})::int as year,
        ${history.playedAt} as played_at,
        ${tracks.id} as track_id,
        ${tracks.spotifyId} as spotify_id,
        ${tracks.name} as name,
        ${tracks.durationMs} as duration_ms
      FROM ${history}
      JOIN ${tracks} ON ${history.trackId} = ${tracks.id}
      WHERE ${history.userId} = ${userId}
        AND EXTRACT(MONTH FROM ${history.playedAt}) = ${month}
        AND EXTRACT(DAY FROM ${history.playedAt}) = ${day}
      ORDER BY ${history.playedAt} DESC
    `);

    // Group by year
    const byYear = new Map<
      number,
      {
        track: { id: string; spotifyId: string; name: string; durationMs: number | null };
        playedAt: Date;
      }[]
    >();

    for (const row of rows.rows) {
      const year = Number(row.year);
      if (!byYear.has(year)) byYear.set(year, []);
      byYear.get(year)!.push({
        track: {
          id: row.track_id,
          spotifyId: row.spotify_id,
          name: row.name,
          durationMs: row.duration_ms,
        },
        playedAt: new Date(row.played_at),
      });
    }

    return Array.from(byYear.entries())
      .sort(([a], [b]) => b - a)
      .map(([year, plays]) => ({ year, plays }));
  }

  async getGenreFlowData(userId: string, weeks = 12) {
    const since = new Date();
    since.setDate(since.getDate() - weeks * 7);

    const rows = await db.execute<{ week: string; genre: string; count: string }>(sql`
      SELECT
        DATE_TRUNC('week', ${history.playedAt})::date::text as week,
        genre,
        count(*)::int as count
      FROM ${history}
      JOIN ${tracks} ON ${history.trackId} = ${tracks.id}
      JOIN ${trackArtists} ON ${tracks.id} = ${trackArtists.trackId}
      JOIN ${artists} ON ${trackArtists.artistId} = ${artists.id}
      CROSS JOIN LATERAL jsonb_array_elements_text(${artists.genres}) AS genre
      WHERE ${history.userId} = ${userId}
        AND ${history.playedAt} >= ${since}
      GROUP BY week, genre
      ORDER BY week, count DESC
    `);

    return rows.rows.map((r) => ({ week: r.week, genre: r.genre, count: Number(r.count) }));
  }
}
