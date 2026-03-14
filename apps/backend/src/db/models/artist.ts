import { inArray } from "drizzle-orm";

import { db } from "../postgres";
import { artists } from "../postgres/schema";

export type Artist = typeof artists.$inferSelect;
export type NewArtist = typeof artists.$inferInsert;

export class ArtistModel {
  async upsertMany(data: NewArtist[]) {
    if (data.length === 0) {
      return [];
    }

    return db
      .insert(artists)
      .values(data)
      .onConflictDoUpdate({
        target: artists.spotifyId,
        set: {
          name: artists.name,
          genres: artists.genres,
          images: artists.images,
          popularity: artists.popularity,
        },
      })
      .returning();
  }

  async findBySpotifyIds(spotifyIds: string[]) {
    if (spotifyIds.length === 0) {
      return [];
    }

    return db.select().from(artists).where(inArray(artists.spotifyId, spotifyIds));
  }
}
