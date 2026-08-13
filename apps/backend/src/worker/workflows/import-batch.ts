import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { JsonObject } from "@hatchet-dev/typescript-sdk";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { config } from "../../config";
import { db } from "../../db";
import { db as drizzleDb } from "../../db/postgres";
import { account, importJobs } from "../../db/postgres/schema";
import { logger } from "../../library/logger";
import { withRetry } from "../../library/retry";
import { createSpotifyClient, refreshAndStoreToken } from "../../library/spotify";
import { fetchHydratedArtists } from "../../library/spotify-artists";
import { type SpotifyExportEntry, trackIdFromUri } from "../../library/spotify-export";
import { hatchet } from "../client";

export type { SpotifyExportEntry };

interface Input extends JsonObject {
  userId: string;
  jobId: string;
  batchKey: string;
}

export const BATCH_SIZE = 50;

const spotifyExportEntrySchema = z.object({
  ts: z.string(),
  master_metadata_track_name: z.string().nullable(),
  master_metadata_album_artist_name: z.string().nullable(),
  master_metadata_album_album_name: z.string().nullable(),
  spotify_track_uri: z.string().nullable(),
  ms_played: z.number(),
});

function requiredId(ids: Record<string, string>, spotifyId: string, entity: string) {
  const id = ids[spotifyId];
  if (!id) throw new Error(`Missing saved ${entity} for Spotify ID ${spotifyId}`);
  return id;
}

export const importBatch = hatchet.workflow<Input>({
  name: "import-batch",
});

importBatch.task({
  name: "run",
  executionTimeout: "5m",
  fn: async (input) => {
    const { userId, jobId, batchKey } = input;

    const s3 = new S3Client({
      region: config.s3.region,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
      ...(config.s3.endpoint && { endpoint: config.s3.endpoint, forcePathStyle: true }),
    });

    const obj = await s3.send(new GetObjectCommand({ Bucket: config.s3.bucket, Key: batchKey }));
    if (!obj.Body) throw new Error("Import batch is empty");
    const bodyBytes = await obj.Body.transformToByteArray();
    const chunk = z
      .array(spotifyExportEntrySchema)
      .parse(JSON.parse(new TextDecoder().decode(bodyBytes)));

    const [spotifyAccount] = await drizzleDb
      .select()
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.providerId, "spotify")))
      .limit(1);

    if (!spotifyAccount) throw new Error("No Spotify account found");

    const accessToken = await refreshAndStoreToken(spotifyAccount);
    const spotify = createSpotifyClient(accessToken);

    const trackUris = [
      ...new Set(
        chunk.flatMap((entry) => (entry.spotify_track_uri ? [entry.spotify_track_uri] : [])),
      ),
    ];
    const trackIds = trackUris
      .map(trackIdFromUri)
      .filter((trackId): trackId is string => trackId !== undefined);

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
          trackId: requiredId(trackIdBySpotifyId, track.id, "track"),
          artistId: requiredId(artistIdBySpotifyId, artist.id, "artist"),
        })),
      ),
    );

    const historyRows = chunk
      .map((entry) => {
        const spotifyId = entry.spotify_track_uri
          ? trackIdFromUri(entry.spotify_track_uri)
          : undefined;
        const trackId = spotifyId ? trackIdBySpotifyId[spotifyId] : undefined;
        if (!trackId) return null;
        return { userId, trackId, playedAt: new Date(entry.ts) };
      })
      .filter((row): row is { userId: string; trackId: string; playedAt: Date } => row !== null);

    await db.history.insertMany(historyRows);

    await drizzleDb
      .update(importJobs)
      .set({
        importedTracks: sql`COALESCE(${importJobs.importedTracks}, 0) + ${historyRows.length}`,
      })
      .where(eq(importJobs.id, jobId));

    logger.worker.info(
      { userId, jobId, batchKey, importedCount: historyRows.length },
      "batch complete",
    );
  },
});
