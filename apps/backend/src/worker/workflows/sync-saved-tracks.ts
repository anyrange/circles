import type { JsonObject } from "@hatchet-dev/typescript-sdk";
import { and, eq } from "drizzle-orm";

import { db } from "../../db";
import { db as drizzleDb } from "../../db/postgres";
import { account } from "../../db/postgres/schema";
import { logger } from "../../library/logger";
import { withRetry } from "../../library/retry";
import { createSpotifyClient, hasSpotifyScope, refreshAndStoreToken } from "../../library/spotify";
import { hatchet } from "../client";

interface Input extends JsonObject {
  userId: string;
}

export const syncSavedTracks = hatchet.workflow<Input>({
  name: "sync-saved-tracks",
});

syncSavedTracks.task({
  name: "fetch-and-store",
  fn: async ({ userId }) => {
    const [spotifyAccount] = await drizzleDb
      .select()
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.providerId, "spotify")))
      .limit(1);

    if (!spotifyAccount) {
      logger.worker.warn({ userId }, "spotify account not found for saved-track sync");
      return;
    }

    if (!hasSpotifyScope(spotifyAccount.scope, "user-library-read")) {
      logger.worker.info({ userId }, "saved-track sync requires Spotify reconnection");
      return;
    }

    const accessToken = await refreshAndStoreToken(spotifyAccount);
    const spotify = createSpotifyClient(accessToken);
    const savedTrackRows: Array<{ userId: string; trackId: string; addedAt: Date }> = [];

    let offset = 0;
    let total = 0;

    do {
      const page = await withRetry(() => spotify.currentUser.tracks.savedTracks(50, offset));
      total = page.total;
      if (page.items.length === 0 && offset < total) {
        throw new Error(`Spotify returned an empty saved-track page at offset ${offset}`);
      }

      const spotifyAlbums = Object.values(
        Object.fromEntries(page.items.map(({ track }) => [track.album.id, track.album])),
      );
      const spotifyArtists = Object.values(
        Object.fromEntries(
          page.items.flatMap(({ track }) => track.artists.map((artist) => [artist.id, artist])),
        ),
      );
      const spotifyTracks = page.items.map(({ track }) => track);

      const storedAlbums = await db.album.upsertMany(
        spotifyAlbums.map((album) => ({
          spotifyId: album.id,
          name: album.name,
          albumType: album.album_type,
          totalTracks: album.total_tracks,
          releaseDate: album.release_date,
          images: album.images,
        })),
      );
      const albumIdBySpotifyId = Object.fromEntries(
        storedAlbums.map((album) => [album.spotifyId, album.id]),
      );

      const storedArtists = await db.artist.upsertMany(
        spotifyArtists.map((artist) => ({ spotifyId: artist.id, name: artist.name })),
      );
      const artistIdBySpotifyId = Object.fromEntries(
        storedArtists.map((artist) => [artist.spotifyId, artist.id]),
      );

      const storedTracks = await db.track.upsertMany(
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
        storedTracks.map((track) => [track.spotifyId, track.id]),
      );

      await db.track.upsertTrackArtists(
        spotifyTracks.flatMap((track) =>
          track.artists.map((artist) => ({
            trackId: trackIdBySpotifyId[track.id]!,
            artistId: artistIdBySpotifyId[artist.id]!,
          })),
        ),
      );

      savedTrackRows.push(
        ...page.items.map(({ added_at, track }) => ({
          userId,
          trackId: trackIdBySpotifyId[track.id]!,
          addedAt: new Date(added_at),
        })),
      );

      offset += page.items.length;
    } while (offset < total);

    // Replace only after every Spotify page succeeds, preserving the last good snapshot on errors.
    await db.savedTrack.replaceForUser(userId, savedTrackRows);
    logger.worker.info({ userId, count: savedTrackRows.length }, "saved tracks synced");
  },
});
