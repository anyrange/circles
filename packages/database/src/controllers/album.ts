import { prisma } from "../client"
import { sanitizeAlbum } from "../helpers"

import type { ExtendedAlbum } from "@circles/types"

export async function create(data: ExtendedAlbum) {
  const album = await prisma.album.create(sanitizeAlbum(data))

  return album
}

export async function createMany(data: ExtendedAlbum[]) {
  if (!data.length) return []

  const albums = await prisma.$transaction(
    data.map((album) => prisma.album.create(sanitizeAlbum(album)))
  )

  return albums
}

export async function checkMany(ids: ExtendedAlbum["id"][]) {
  if (!ids.length) return []

  const results = await prisma.$transaction(
    ids.map((id) =>
      prisma.album.findUnique({
        select: { id: true },
        where: { id },
      })
    )
  )

  const albums = results.filter((album) => album !== null) as { id: string }[]

  return albums.map(({ id }) => id)
}
