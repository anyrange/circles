import type { JsonObject } from "@hatchet-dev/typescript-sdk";
import { and, eq, notExists } from "drizzle-orm";

import { db } from "../../db";
import { db as drizzleDb } from "../../db/postgres";
import { account, audioFeatures, tracks } from "../../db/postgres/schema";
import { fetchHydratedArtists } from "../../lib/spotify-artists";
import { logger } from "../../library/logger";
import { createSpotifyClient, refreshAndStoreToken } from "../../library/spotify";
import { hatchet } from "../client";

interface Input extends JsonObject {
  userId: string;
}

export const syncHistory = hatchet.workflow<Input>({
  name: "sync-history",
});

syncHistory.task({
  name: "fetch-and-store",
  fn: async (input) => {
    const { userId } = input;

    const [spotifyAccount] = await drizzleDb
      .select()
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.providerId, "spotify")))
      .limit(1);

    if (!spotifyAccount) {
      logger.worker.warn({ userId }, "spotify account not found for sync-history");
      return;
    }

    const accessToken = await refreshAndStoreToken(spotifyAccount);
    const spotify = createSpotifyClient(accessToken);

    // Fetch up to 50 recently played, after last known entry
    const after = await db.history.getLatestPlayedAt(userId);
    const recentlyPlayed = await spotify.player.getRecentlyPlayedTracks(
      50,
      after ? { timestamp: after.getTime(), type: "after" } : undefined,
    );

    const items = recentlyPlayed.items;
    if (items.length === 0) {
      logger.worker.info({ userId }, "no new tracks to sync");
      return;
    }

    logger.worker.info({ userId, count: items.length }, "syncing tracks");

    // Collect unique albums, artists, tracks
    const spotifyAlbums = Object.values(
      Object.fromEntries(items.map((item) => [item.track.album.id, item.track.album])),
    );
    const spotifyArtists = Object.values(
      Object.fromEntries(
        items.flatMap((item) => item.track.artists.map((artist) => [artist.id, artist])),
      ),
    );
    const spotifyTracks = Object.values(
      Object.fromEntries(items.map((item) => [item.track.id, item.track])),
    );

    // Upsert albums
    const savedAlbums = await db.album.upsertMany(
      spotifyAlbums.map((album) => ({
        spotifyId: album.id,
        name: album.name,
        albumType: album.album_type,
        releaseDate: album.release_date,
        images: album.images,
      })),
    );
    const albumIdBySpotifyId = Object.fromEntries(
      savedAlbums.map((album) => [album.spotifyId, album.id]),
    );

    // Upsert artists
    const savedArtists = await db.artist.upsertMany(
      await fetchHydratedArtists(
        spotify,
        spotifyArtists.map((artist) => ({
          id: artist.id,
          name: artist.name,
        })),
      ),
    );
    const artistIdBySpotifyId = Object.fromEntries(
      savedArtists.map((artist) => [artist.spotifyId, artist.id]),
    );

    // Upsert tracks
    const savedTracks = await db.track.upsertMany(
      spotifyTracks.map((track) => ({
        spotifyId: track.id,
        name: track.name,
        durationMs: track.duration_ms,
        explicit: track.explicit,
        popularity: track.popularity,
        albumId: albumIdBySpotifyId[track.album.id],
      })),
    );
    const trackIdBySpotifyId = Object.fromEntries(
      savedTracks.map((track) => [track.spotifyId, track.id]),
    );

    // Upsert track-artist relations
    await db.track.upsertTrackArtists(
      spotifyTracks.flatMap((track) =>
        track.artists.map((artist) => ({
          trackId: trackIdBySpotifyId[track.id]!,
          artistId: artistIdBySpotifyId[artist.id]!,
        })),
      ),
    );

    // Insert history entries
    await db.history.insertMany(
      items.map((item) => ({
        userId,
        trackId: trackIdBySpotifyId[item.track.id]!,
        playedAt: new Date(item.played_at),
      })),
    );

    // Sync audio features for newly inserted tracks that don't have them
    const tracksWithoutFeatures = await drizzleDb
      .select({ id: tracks.id, spotifyId: tracks.spotifyId })
      .from(tracks)
      .where(
        and(
          notExists(
            drizzleDb
              .select({ trackId: audioFeatures.trackId })
              .from(audioFeatures)
              .where(eq(audioFeatures.trackId, tracks.id)),
          ),
          eq(
            tracks.id,
            // Only check tracks we just saved
            tracks.id,
          ),
        ),
      )
      .limit(100);

    // Filter to only the tracks we just upserted
    const newTrackIds = new Set(savedTracks.map((t) => t.id));
    const tracksNeedingFeatures = tracksWithoutFeatures.filter((t) => newTrackIds.has(t.id));

    if (tracksNeedingFeatures.length > 0) {
      const spotifyIds = tracksNeedingFeatures.map((t) => t.spotifyId);

      for (let i = 0; i < spotifyIds.length; i += 100) {
        const batch = spotifyIds.slice(i, i + 100);
        try {
          const validFeatures = (await spotify.tracks.audioFeatures(batch)).filter(Boolean);

          if (validFeatures.length > 0) {
            await db.track.upsertAudioFeatures(
              validFeatures.map((f) => ({
                trackId:
                  trackIdBySpotifyId[f.id] ??
                  tracksNeedingFeatures.find((t) => t.spotifyId === f.id)?.id ??
                  "",
                danceability: f.danceability,
                energy: f.energy,
                key: f.key,
                loudness: f.loudness,
                mode: f.mode,
                speechiness: f.speechiness,
                acousticness: f.acousticness,
                instrumentalness: f.instrumentalness,
                liveness: f.liveness,
                valence: f.valence,
                tempo: f.tempo,
                timeSignature: f.time_signature,
              })),
            );
          }
        } catch (err: unknown) {
          const status = (err as { status?: number })?.status;
          if (status === 403 || status === 404) {
            logger.worker.warn(
              { userId },
              "audio features endpoint unavailable (deprecated), skipping",
            );
          } else {
            logger.worker.warn({ err, userId }, "failed to fetch audio features");
          }
        }
      }
    }

    logger.worker.info({ userId, count: items.length }, "sync complete");
  },
});
