import prisma from "../client"

import type { ExtendedAlbum } from "@circles/types"

export async function create(data: ExtendedAlbum) {
  const high = data.images.pop()?.url || ""
  const medium = data.images.pop()?.url || high
  const low = data.images.pop()?.url || medium

  const album = await prisma.album.create({
    data: {
      id: data.id,
      name: data.name,
      total_tracks: data.total_tracks,
      release_date: new Date(data.release_date),
      label: data.label,
      popularity: data.popularity,
      url: data.external_urls.spotify,
      release_date_precision: data.release_date_precision,
      album_type: data.album_type,
      genres: {
        connectOrCreate: data.genres.map((genre) => ({
          where: { name: genre },
          create: { name: genre },
        })),
      },
      Images: {
        create: { high, medium, low },
      },
    },
  })
  return album
}

export async function createMany(data: ExtendedAlbum[]) {
  if (!data.length) return []
  const albums = await prisma.$transaction(
    data.map((album) => {
      const high = album.images.pop()?.url || ""
      const medium = album.images.pop()?.url || high
      const low = album.images.pop()?.url || medium

      return prisma.album.create({
        data: {
          id: album.id,
          name: album.name,
          total_tracks: album.total_tracks,
          release_date: new Date(album.release_date),
          label: album.label,
          popularity: album.popularity,
          url: album.external_urls.spotify,
          release_date_precision: album.release_date_precision,
          album_type: album.album_type,

          genres: {
            connectOrCreate: album.genres.map((genre) => ({
              where: { name: genre },
              create: { name: genre },
            })),
          },
          Images: {
            create: { high, medium, low },
          },
        },
      })
    })
  )

  return albums
}

export async function checkMany(ids: ExtendedAlbum["id"][]) {
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
