import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { JsonObject } from "@hatchet-dev/typescript-sdk";
import { and, eq, sql } from "drizzle-orm";

import { config } from "../../config";
import { db } from "../../db";
import { db as drizzleDb } from "../../db/postgres";
import { account, importJobs } from "../../db/postgres/schema";
import { fetchHydratedArtists } from "../../lib/spotify-artists";
import { logger } from "../../library/logger";
import { createSpotifyClient, refreshAndStoreToken } from "../../library/spotify";
import { hatchet } from "../client";

export interface SpotifyExportEntry extends JsonObject {
  ts: string;
  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
  spotify_track_uri: string | null;
  ms_played: number;
}

interface Input extends JsonObject {
  userId: string;
  jobId: string;
  validKey: string;
  offset: number;
  limit: number;
}

export const BATCH_SIZE = 50;

export const importBatch = hatchet.workflow<Input>({
  name: "import-batch",
});

importBatch.task({
  name: "run",
  executionTimeout: "5m",
  fn: async (input) => {
    const { userId, jobId, validKey, offset, limit } = input;

    const s3 = new S3Client({
      region: config.s3.region,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
      ...(config.s3.endpoint && { endpoint: config.s3.endpoint, forcePathStyle: true }),
    });

    const obj = await s3.send(new GetObjectCommand({ Bucket: config.s3.bucket, Key: validKey }));
    const bodyBytes = await streamToBuffer(obj.Body as NodeJS.ReadableStream);
    const valid: SpotifyExportEntry[] = JSON.parse(new TextDecoder().decode(bodyBytes));
    const chunk = valid.slice(offset, offset + limit);

    const [spotifyAccount] = await drizzleDb
      .select()
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.providerId, "spotify")))
      .limit(1);

    if (!spotifyAccount) throw new Error("No Spotify account found");

    const accessToken = await refreshAndStoreToken(spotifyAccount);
    const spotify = createSpotifyClient(accessToken);

    const trackUris = [...new Set(chunk.map((e) => e.spotify_track_uri!))];
    const trackIds = trackUris.map((uri) => uri.split(":")[2]).filter(Boolean) as string[];

    const trackDetails = await withRetry(() => spotify.tracks.get(trackIds));
    const tracksArray = Array.isArray(trackDetails) ? trackDetails : [trackDetails];

    const spotifyAlbums = Object.values(
      Object.fromEntries(tracksArray.map((t) => [t.album.id, t.album])),
    );
    const spotifyArtists = Object.values(
      Object.fromEntries(tracksArray.flatMap((t) => t.artists.map((a) => [a.id, a]))),
    );

    const savedAlbums = await db.album.upsertMany(
      spotifyAlbums.map((album) => ({
        spotifyId: album.id,
        name: album.name,
        albumType: album.album_type,
        releaseDate: album.release_date,
        images: album.images,
      })),
    );
    const albumIdBySpotifyId = Object.fromEntries(savedAlbums.map((a) => [a.spotifyId, a.id]));

    const savedArtists = await db.artist.upsertMany(
      await fetchHydratedArtists(
        spotify,
        spotifyArtists.map((artist) => ({ id: artist.id, name: artist.name })),
      ),
    );
    const artistIdBySpotifyId = Object.fromEntries(savedArtists.map((a) => [a.spotifyId, a.id]));

    const savedTracks = await db.track.upsertMany(
      tracksArray.map((track) => ({
        spotifyId: track.id,
        name: track.name,
        durationMs: track.duration_ms,
        explicit: track.explicit,
        popularity: track.popularity,
        albumId: albumIdBySpotifyId[track.album.id],
      })),
    );
    const trackIdBySpotifyId = Object.fromEntries(savedTracks.map((t) => [t.spotifyId, t.id]));

    await db.track.upsertTrackArtists(
      tracksArray.flatMap((track) =>
        track.artists.map((artist) => ({
          trackId: trackIdBySpotifyId[track.id]!,
          artistId: artistIdBySpotifyId[artist.id]!,
        })),
      ),
    );

    const historyRows = chunk
      .map((entry) => {
        const spotifyId = entry.spotify_track_uri!.split(":")[2];
        const trackId = spotifyId ? trackIdBySpotifyId[spotifyId] : undefined;
        if (!trackId) return null;
        return { userId, trackId, playedAt: new Date(entry.ts) };
      })
      .filter(Boolean) as { userId: string; trackId: string; playedAt: Date }[];

    await db.history.insertMany(historyRows);

    await drizzleDb
      .update(importJobs)
      .set({
        importedTracks: sql`COALESCE(${importJobs.importedTracks}, 0) + ${historyRows.length}`,
      })
      .where(eq(importJobs.id, jobId));

    logger.worker.info(
      { userId, jobId, offset, importedCount: historyRows.length },
      "batch complete",
    );
  },
});

async function withRetry<T>(fn: () => Promise<T>, retries = 5): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRateLimit = err instanceof Error && err.message.toLowerCase().includes("rate limit");
      if (!isRateLimit || attempt === retries - 1) throw err;
      const delay = 30_000 + Math.random() * 10_000; // 30-40s with jitter
      logger.worker.warn({ attempt, delay: Math.round(delay) }, "spotify rate limited, waiting");
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("unreachable");
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Uint8Array> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string));
  }
  return Buffer.concat(chunks);
}
