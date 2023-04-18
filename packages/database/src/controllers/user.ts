import type { User, Tokens, HistoryRecord } from "@circles/types"
import { prisma } from "../client"
import { selectTrackShort, selectAlbum, selectArtist } from "../helpers"

type UserWithTokens = User & {
  access_token: Tokens["access_token"]
  refresh_token: Tokens["refresh_token"]
}

export async function upsert(data: UserWithTokens) {
  const changingInfo = {
    display_name: data.display_name,
    avatar: data.images[0].url || "",
    country: data.country,
    email: data.email,
    product: data.product,
    filter_enabled: data.explicit_content.filter_enabled,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  }

  const user = await prisma.user.upsert({
    where: { id: data.id },
    create: {
      id: data.id,
      ...changingInfo,
      url: data.external_urls.spotify,
      type: data.type,
    },
    update: {
      ...changingInfo,
      last_login: new Date(),
    },
    select: {
      id: true,
      display_name: true,
      avatar: true,
      country: true,
      email: true,
      product: true,
      filter_enabled: true,
      url: true,
      type: true,
      privacy: true,
      last_login: true,
      registration_date: true,
    },
  })

  return user
}

export async function getOne(id: User["id"]) {
  const user = await prisma.user.findUnique({ where: { id } })

  return user
}

export async function lastListened(id: User["id"]) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      history: {
        orderBy: { played_at: "desc" },
        take: 1,
      },
    },
  })

  return user?.history[0] || undefined
}

export async function getUserTokens(id: User["id"]) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, access_token: true },
  })

  return user
}

export async function updateTokens(
  id: User["id"],
  access_token: Tokens["access_token"]
) {
  const user = await prisma.user.update({
    where: { id },
    data: { access_token },
    select: { id: true, access_token: true },
  })

  return user
}

export async function updateManyTokens(
  users: {
    id: User["id"]
    access_token: Tokens["access_token"]
    refresh_is_valid: boolean
  }[]
) {
  if (!users.length) return []

  const results = await prisma.$transaction(
    users.map(({ id, access_token, refresh_is_valid }) =>
      prisma.user.update({
        where: { id },
        data: { access_token, refresh_is_valid },
        select: { id: true, access_token: true },
      })
    )
  )

  return results
}

export async function updateHistory(id: User["id"], history: HistoryRecord[]) {
  if (!history.length) return []

  const user = await prisma.user.update({
    where: { id },
    data: { history: { createMany: { data: history } } },
    select: {
      history: { select: { track_id: true, played_at: true } },
      id: true,
    },
  })

  return user
}

export async function getHistory(id: User["id"], limit: number, cursorId = 0) {
  if (limit < 1) return []

  const history = await prisma.history.findMany({
    where: { user_id: id },
    orderBy: { played_at: "desc" },
    ...(cursorId && { cursor: { id: cursorId }, skip: 1 }),
    select: {
      id: true,
      track_id: true,
      played_at: true,
      track: selectTrackShort,
    },
    take: limit,
  })

  return history
}

export async function getTracks(
  id: User["id"],
  limit: number,
  page = 1,
  start?: Date,
  end?: Date
) {
  if (limit < 1) return []

  const tracks = await prisma.history.groupBy({
    where: { user_id: id },
    by: ["track_id"],
    _count: { track_id: true },
    orderBy: { _count: { track_id: "desc" } },
    ...(start && { where: { played_at: { gte: start } } }),
    ...(end && { where: { played_at: { lte: end } } }),

    skip: (page - 1) * limit,
    take: limit,
  })

  const info = await prisma.$transaction(
    tracks.map(({ track_id }) =>
      prisma.track.findUniqueOrThrow({
        where: { id: track_id },
        select: selectTrackShort.select,
      })
    )
  )

  return tracks.map(({ _count }, id) => ({
    count: _count.track_id,
    track: info[id],
  }))
}

export async function getAlbums(
  id: User["id"],
  limit: number,
  page = 1
  // start?: Date,
  // end?: Date
) {
  if (limit < 1) return []

  const albums = await prisma.$queryRaw<
    { album_id: string; c: BigInt }[]
  >`SELECT album_id, count(album_id) c FROM "History" 
    JOIN "Track" as T ON track_id=T.id WHERE user_id=${id} GROUP BY album_id
    ORDER BY c DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`

  const info = await prisma.$transaction(
    albums.map(({ album_id }) =>
      prisma.album.findUniqueOrThrow({
        where: { id: album_id },
        select: selectAlbum.select,
      })
    )
  )

  return albums.map(({ c }, id) => ({
    count: Number(c),
    track: info[id],
  }))
}

export async function getArtists(
  id: User["id"],
  limit: number,
  page = 1
  // start?: Date,
  // end?: Date
) {
  if (limit < 1) return []

  const artists = await prisma.$queryRaw<
    { artist_id: string; c: BigInt }[]
  >`SELECT artist_id, count(artist_id) c FROM "History" 
    JOIN "Track" as T ON track_id=T.id WHERE user_id=${id} GROUP BY artist_id
    ORDER BY c DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`

  const info = await prisma.$transaction(
    artists.map(({ artist_id }) =>
      prisma.artist.findUniqueOrThrow({
        where: { id: artist_id },
        select: selectArtist.select,
      })
    )
  )

  return artists.map(({ c }, id) => ({
    count: Number(c),
    track: info[id],
  }))
}
