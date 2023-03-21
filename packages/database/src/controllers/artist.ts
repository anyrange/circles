import { prisma } from "../client"
import { sanitizeArtist } from "../helpers"

import type { ExtendedArtist } from "@circles/types"

export async function create(data: ExtendedArtist) {
  const artist = await prisma.artist.create(sanitizeArtist(data))

  return artist
}

export async function createMany(data: ExtendedArtist[]) {
  if (!data.length) return []

  const artists = await prisma.$transaction(
    data.map((artist) => prisma.artist.create(sanitizeArtist(artist)))
  )

  return artists
}

export async function filterExistingArtistIds(ids: ExtendedArtist["id"][]) {
  if (!ids.length) return []

  const results = await prisma.$transaction(
    ids.map((id) =>
      prisma.artist.findUnique({
        select: { id: true },
        where: { id },
      })
    )
  )
  const existingArtists = new Set<ExtendedArtist["id"]>()

  results.forEach((artist) => {
    if (artist !== null) existingArtists.add(artist.id)
  })

  return ids.filter((artist) => !existingArtists.has(artist))
}
