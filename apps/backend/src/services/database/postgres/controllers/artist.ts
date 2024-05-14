import { inArray, sql } from "drizzle-orm";
import type { ExtendedArtist } from "@/types";
import { type DB, artists, artistsToGenres, genres, images } from "../schema";
import { extractImages, formatArtist } from "../helpers";

export const createArtistController = (db: DB) => {
  const create = async (data: ExtendedArtist) => {
    return db.transaction(async (tx) => {
      const { images_id } = await tx
        .insert(images)
        .values(extractImages(data))
        .returning({ images_id: images.id })
        .then((item) => item[0]);

      if (data.genres.length) {
        const genres_ids = await tx
          .insert(genres)
          .values(data.genres.map((name) => ({ name })))
          .returning({ id: genres.id })
          .onConflictDoNothing();

        await tx.insert(artistsToGenres).values(
          genres_ids.map(({ id }) => ({
            genre_id: id,
            artist_id: data.id,
          })),
        );
      }

      return await tx
        .insert(artists)
        .values({ ...formatArtist(data), images_id })
        .returning()
        .then((item) => item[0]);
    });
  };

  const createMany = async (data: ExtendedArtist[]) => {
    if (!data.length) {
      return [];
    }

    return db.transaction(async (tx) => {
      const images_ids = await tx
        .insert(images)
        .values(data.map((artist) => extractImages(artist)))
        .returning({ images_id: images.id });

      data.forEach((artist) => {
        if (!artist.genres.length) {
          return;
        }

        tx.transaction(async (tx2) => {
          const genres_ids = await tx2
            .insert(genres)
            .values(artist.genres.map((name) => ({ name })))
            .returning({ id: genres.id })
            .onConflictDoNothing();

          await tx2.insert(artistsToGenres).values(
            genres_ids.map(({ id }) => ({
              genre_id: id,
              artist_id: artist.id,
            })),
          );
        });
      });

      return await tx
        .insert(artists)
        .values(
          data.map((artist, id) => ({
            ...formatArtist(artist),
            ...images_ids[id],
          })),
        )
        .returning();
    });
  };

  const filterExistingArtistIds = async (ids: ExtendedArtist["id"][]) => {
    if (!ids.length) {
      return [];
    }

    const results = await db
      .select({ id: artists.id })
      .from(artists)
      .where(inArray(artists.id, ids));

    const existingArtists = new Set<ExtendedArtist["id"]>(
      results.map(({ id }) => id),
    );

    return ids.filter((album) => !existingArtists.has(album));
  };

  const count = async () => {
    return await db
      .select({ count: sql<number>`count(*)` })
      .from(artists)
      .then((res) => res[0].count);
  };

  return {
    create,
    createMany,
    count,
    filterExistingArtistIds,
  };
};
