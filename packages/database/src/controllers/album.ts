import { inArray, sql } from "drizzle-orm"
import type { ExtendedAlbum } from "@circles/types"
import { albums, images } from "../schema"
import type { DB } from "../schema"
import { extractImages, formatAlbum } from "../helpers"

export const createAlbumController = (db: DB) => {
  const create = async (data: ExtendedAlbum) => {
    return db.transaction(async (tx) => {
      const { images_id } = await tx
        .insert(images)
        .values(extractImages(data))
        .returning({ images_id: images.id })
        .then((item) => item[0])
      return await tx
        .insert(albums)
        .values({ ...formatAlbum(data), images_id })
        .returning()
        .then((item) => item[0])
    })
  }

  const createMany = async (data: ExtendedAlbum[]) => {
    if (!data.length) return []

    return db.transaction(async (tx) => {
      const images_ids = await tx
        .insert(images)
        .values(data.map((album) => extractImages(album)))
        .returning({ images_id: images.id })

      return await tx
        .insert(albums)
        .values(
          data.map((album, id) => ({
            ...formatAlbum(album),
            ...images_ids[id],
          }))
        )
        .returning()
    })
  }

  const filterExistingAlbumIds = async (ids: ExtendedAlbum["id"][]) => {
    if (!ids.length) return []

    const results = await db
      .select({ id: albums.id })
      .from(albums)
      .where(inArray(albums.id, ids))

    const existingAlbums = new Set<ExtendedAlbum["id"]>(
      results.map(({ id }) => id)
    )

    return ids.filter((album) => !existingAlbums.has(album))
  }

  const count = async () => {
    return await db
      .select({ count: sql<number>`count(*)` })
      .from(albums)
      .then((res) => res[0].count)
  }

  return {
    create,
    createMany,
    count,
    filterExistingAlbumIds,
  }
}
