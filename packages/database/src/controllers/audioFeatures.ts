import prisma from "../client"

import type { AudioFeature } from "@circles/types"

export async function create(data: AudioFeature) {
  const features = await prisma.audioFeatures.create({
    data: {
      track_id: data.id,
      acousticness: data.acousticness,
      dancebility: data.danceability,
      energy: data.energy,
      instrumentalness: data.instrumentalness,
      liveness: data.liveness,
      loudness: data.loudness,
      speechiness: data.speechiness,
      tempo: data.tempo,
      valence: data.valence,
    },
  })
  return features
}

export async function createMany(data: AudioFeature[]) {
  if (!data.length) return []
  const features = await prisma.audioFeatures.createMany({
    data: data.map((item) => ({
      track_id: item.id,
      acousticness: item.acousticness,
      dancebility: item.danceability,
      energy: item.energy,
      instrumentalness: item.instrumentalness,
      liveness: item.liveness,
      loudness: item.loudness,
      speechiness: item.speechiness,
      tempo: item.tempo,
      valence: item.valence,
    })),
  })
  return features
}
