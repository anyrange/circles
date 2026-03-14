import { inArray } from "drizzle-orm";

import { db } from "../postgres";
import { audioFeatures, trackArtists, tracks } from "../postgres/schema";

export type Track = typeof tracks.$inferSelect;
export type NewTrack = typeof tracks.$inferInsert;
export type NewTrackArtist = typeof trackArtists.$inferInsert;
export type NewAudioFeatures = typeof audioFeatures.$inferInsert;

export class TrackModel {
  async upsertMany(data: NewTrack[]) {
    if (data.length === 0) {
      return [];
    }

    return db
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

    await db.insert(trackArtists).values(data).onConflictDoNothing();
  }

  async upsertAudioFeatures(data: NewAudioFeatures[]) {
    if (data.length === 0) {
      return;
    }

    await db
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

    return db.select().from(tracks).where(inArray(tracks.spotifyId, spotifyIds));
  }
}
