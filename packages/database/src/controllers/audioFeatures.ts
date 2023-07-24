import type { AudioFeature } from "@circles/types"
import { audioFeatures } from "../schema"
import type { DB } from "../schema"
import { formatAudioFeatures } from "../helpers"

export const createAudioFeaturesController = (db: DB) => {
  const create = async (data: AudioFeature) => {
    return db
      .insert(audioFeatures)
      .values(formatAudioFeatures(data))
      .returning()
      .then((item) => item[0])
  }

  const createMany = async (data: AudioFeature[]) => {
    if (!data.length) return []

    return db
      .insert(audioFeatures)
      .values(data.map((features) => formatAudioFeatures(features)))
      .returning()
  }

  return {
    create,
    createMany,
  }
}
