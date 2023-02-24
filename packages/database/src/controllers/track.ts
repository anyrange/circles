import { prisma } from "../client"
import { sanitizeTrack } from "../helpers"

import type { Track } from "@circles/types"

export async function create(data: Track) {
  const track = await prisma.track.create(sanitizeTrack(data))

  return track
}

export async function createMany(data: Track[]) {
  if (!data.length) return []

  const tracks = await prisma.$transaction(
    data.map((track) => prisma.track.create(sanitizeTrack(track)))
  )

  return tracks
}

export async function checkMany(ids: Track["id"][]) {
  if (!ids.length) return []

  const results = await prisma.$transaction(
    ids.map((id) =>
      prisma.track.findUnique({
        select: { id: true },
        where: { id },
      })
    )
  )

  const tracks = results.filter((track) => track !== null) as { id: string }[]

  return tracks.map(({ id }) => id)
}
