import type { Track, Item } from "@circles/types"
import { tracks, images } from "../schema"
import type { DB } from "../schema"
import { extractImages, formatTrack } from "../helpers"
import { inArray } from "drizzle-orm"

export const createTrackController = (db: DB) => {
  const create = async (data: Track) => {
    return db.transaction(async (tx) => {
      const { images_id } = await tx
        .insert(images)
        .values(extractImages(data.album))
        .returning({ images_id: images.id })
        .then((item) => item[0])

      return await tx
        .insert(tracks)
        .values({ ...formatTrack(data), images_id })
        .returning()
        .then((item) => item[0])
    })
  }

  const createMany = async (data: Track[]) => {
    if (!data.length) return []

    return db.transaction(async (tx) => {
      const images_ids = await tx
        .insert(images)
        .values(data.map((track) => extractImages(track.album)))
        .returning({ images_id: images.id })

      return await tx
        .insert(tracks)
        .values(
          data.map((track, id) => ({
            ...formatTrack(track),
            ...images_ids[id],
          }))
        )
        .returning()
    })
  }

  async function findExistingIds(ids: Track["id"][]) {
    if (!ids.length) return []

    const results = await db
      .select({ id: tracks.id })
      .from(tracks)
      .where(inArray(tracks.id, ids))

    return results.map(({ id }) => id)
  }

  const filterExistingTrackIds = async (ids: Track["id"][]) => {
    const existingTracks = new Set<Track["id"]>(await findExistingIds(ids))

    return ids.filter((track) => !existingTracks.has(track))
  }

  const filterExistingItems = async (items: Item[]) => {
    const ids = items.map(({ track }) => track.id)

    const existingTracks = new Set<Track["id"]>(await findExistingIds(ids))

    return items.filter(({ track }) => !existingTracks.has(track.id))
  }

  return {
    create,
    createMany,
    filterExistingTrackIds,
    filterExistingItems,
  }
}
