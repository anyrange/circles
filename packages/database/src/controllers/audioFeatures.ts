import type { AudioFeature } from "@circles/types"
import { prisma } from "../client"
import { sanitizeAudioFeatures } from "../helpers"

export async function create(data: AudioFeature) {
  const features = await prisma.audioFeatures.create(
    sanitizeAudioFeatures(data)
  )
  return features
}

export async function createMany(data: AudioFeature[]) {
  if (!data.length) return []

  const features = await prisma.audioFeatures.createMany({
    data: data.map((item) => sanitizeAudioFeatures(item).data),
  })

  return features
}
