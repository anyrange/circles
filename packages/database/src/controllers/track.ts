import type { Track, Item } from "@circles/types"
import { prisma } from "../client"
import { sanitizeTrack } from "../helpers"

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

async function findExistingIds(ids: Track["id"][]) {
  const existingTracks = new Set<Track["id"]>()

  if (!ids.length) return existingTracks

  const results = await prisma.$transaction(
    ids.map((id) =>
      prisma.track.findUnique({
        select: { id: true },
        where: { id },
      })
    )
  )

  results.forEach((track) => {
    if (track !== null) existingTracks.add(track.id)
  })

  return existingTracks
}

export async function filterExistingTrackIds(ids: Track["id"][]) {
  const existingTracks = await findExistingIds(ids)

  return ids.filter((track) => !existingTracks.has(track))
}

export async function filterExistingItems(items: Item[]) {
  const ids = items.map(({ track }) => track.id)

  const existingTracks = await findExistingIds(ids)

  return items.filter(({ track }) => !existingTracks.has(track.id))
}
