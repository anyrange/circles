import { prisma } from "../client"

import type { ExtendedArtist } from "@circles/types"

export async function create(data: ExtendedArtist) {
  const high = data.images.pop()?.url || ""
  const medium = data.images.pop()?.url || high
  const low = data.images.pop()?.url || medium

  const artist = await prisma.artist.create({
    data: {
      id: data.id,
      name: data.name,
      followers: data.followers.total,
      url: data.external_urls.spotify,
      popularity: data.popularity,
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

  return artist
}

export async function createMany(data: ExtendedArtist[]) {
  if (!data.length) return []

  const artists = await prisma.$transaction(
    data.map((artist) => {
      const high = artist.images.pop()?.url || ""
      const medium = artist.images.pop()?.url || high
      const low = artist.images.pop()?.url || medium

      return prisma.artist.create({
        data: {
          id: artist.id,
          name: artist.name,
          followers: artist.followers.total,
          url: artist.external_urls.spotify,
          popularity: artist.popularity,
          genres: {
            connectOrCreate: artist.genres.map((genre) => ({
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

  return artists
}

export async function checkMany(ids: ExtendedArtist["id"][]) {
  const results = await prisma.$transaction(
    ids.map((id) =>
      prisma.artist.findUnique({
        select: { id: true },
        where: { id },
      })
    )
  )

  const artists = results.filter((artist) => artist !== null) as {
    id: string
  }[]

  return artists.map(({ id }) => id)
}
