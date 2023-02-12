import prisma from "../client"

import type { Track } from "@circles/types"

export async function create(data: Track) {
  const album = data.album
  const high = album.images.pop()?.url || ""
  const medium = album.images.pop()?.url || high
  const low = album.images.pop()?.url || medium

  const track = await prisma.track.create({
    data: {
      id: data.id,
      name: data.name,
      duration_ms: data.duration_ms,
      release_date: new Date(data.album.release_date),
      popularity: data.popularity,
      disc_number: data.disc_number,
      url: data.external_urls.spotify,
      preview_url: data.preview_url,
      track_number: data.track_number,
      is_local: data.is_local,
      explicit: data.explicit,
      Images: {
        create: { high, medium, low },
      },
      Album: {
        connect: {
          id: album.id,
        },
      },
      Artist: {
        connect: data.artists.map(({ id }) => ({ id })),
      },
    },
  })
  return track
}

export async function createMany(data: Track[]) {
  if (!data.length) return []
  const tracks = await prisma.$transaction(
    data.map((track) => {
      const album = track.album
      const high = album.images.pop()?.url || ""
      const medium = album.images.pop()?.url || high
      const low = album.images.pop()?.url || medium

      return prisma.track.create({
        data: {
          id: track.id,
          name: track.name,
          duration_ms: track.duration_ms,
          release_date: new Date(track.album.release_date),
          popularity: track.popularity,
          disc_number: track.disc_number,
          url: track.external_urls.spotify,
          preview_url: track.preview_url,
          track_number: track.track_number,
          is_local: track.is_local,
          explicit: track.explicit,
          Images: {
            create: { high, medium, low },
          },
          Album: {
            connect: {
              id: album.id,
            },
          },
          Artist: {
            connect: track.artists.map(({ id }) => ({ id })),
          },
        },
      })
    })
  )
  return tracks
}

export async function checkMany(ids: Track["id"][]) {
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
