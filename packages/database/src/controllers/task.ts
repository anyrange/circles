import { prisma } from "../client"
import {
  sanitizeAlbum,
  sanitizeArtist,
  sanitizeTrack,
  sanitizeAudioFeatures,
} from "../helpers"

import type {
  ExtendedAlbum,
  ExtendedArtist,
  Track,
  AudioFeature,
  HistoryRecord,
  User,
} from "@circles/types"

export async function getUsersInfo() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      refresh_token: true,
      access_token: true,
      history: {
        orderBy: { played_at: "desc" },
        take: 1,
      },
    },
    where: {
      refresh_is_valid: true,
    },
  })

  return users.map((user) => ({
    id: user.id,
    refresh_token: user.refresh_token,
    access_token: user.access_token,
    lastHistoryRecord: user.history[0] || undefined,
  }))
}

interface UpdateInfo {
  albums: ExtendedAlbum[]
  artists: ExtendedArtist[]
  tracks: Track[]
  features: AudioFeature[]
  histories: {
    userId: User["id"]
    history: HistoryRecord[]
  }[]
}

export async function updateDatabase(data: UpdateInfo) {
  const { albums, artists, tracks, features, histories } = data

  const newRecords = histories.filter(({ history }) => history.length)

  const isEmpty = !(
    albums.length ||
    artists.length ||
    tracks.length ||
    features.length ||
    newRecords.length
  )

  if (isEmpty) return []

  const result = await prisma.$transaction([
    ...albums.map((album) => prisma.album.create(sanitizeAlbum(album))),
    ...artists.map((artist) => prisma.artist.create(sanitizeArtist(artist))),
    ...tracks.map((track) => prisma.track.create(sanitizeTrack(track))),

    prisma.audioFeatures.createMany({
      data: features.map((item) => sanitizeAudioFeatures(item).data),
    }),

    ...newRecords.map(({ userId, history }) =>
      prisma.user.update({
        where: { id: userId },
        data: {
          history: {
            createMany: {
              data: history,
            },
          },
        },
        select: {
          history: { select: { track_id: true, played_at: true } },
          id: true,
        },
      })
    ),
  ])

  return result
}
