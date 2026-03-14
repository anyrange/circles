import { inArray } from "drizzle-orm";

import { db } from "../postgres";
import { albums } from "../postgres/schema";

export type Album = typeof albums.$inferSelect;
export type NewAlbum = typeof albums.$inferInsert;

export class AlbumModel {
  async upsertMany(data: NewAlbum[]) {
    if (data.length === 0) {
      return [];
    }

    return db
      .insert(albums)
      .values(data)
      .onConflictDoUpdate({
        target: albums.spotifyId,
        set: {
          name: albums.name,
          albumType: albums.albumType,
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

    return db.select().from(albums).where(inArray(albums.spotifyId, spotifyIds));
  }
}
