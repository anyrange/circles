import spotifyAPI from "@circles/spotifyAPI"
import { controllers } from "@circles/database"
import { taskBase } from "../core"

import type { Item, Cursors, HistoryRecord } from "@circles/types"
import type { TaskOptions } from "../core"

export default taskBase(updateUserHistory)

export async function updateUserHistory(
  user: TaskOptions,
  limit = 5,
  backtrackingInfo?: {
    cursors: Cursors
    lastHistoryRecord: HistoryRecord | undefined
  }
) {
  const isBackTracking = !!backtrackingInfo

  const { items, cursors: newCursors } = await spotifyAPI.recentlyPlayed(
    user.access_token,
    limit,
    isBackTracking ? { before: backtrackingInfo.cursors.before } : {}
  )
  if (!items.length) return

  const lastListened = backtrackingInfo
    ? backtrackingInfo.lastHistoryRecord
    : await controllers.user.lastListened(user.id)

  const furtherTrackingInfo = {
    cursors: newCursors,
    lastHistoryRecord: lastListened,
  }

  const notRecordedItems = lastListened
    ? items.filter(
        ({ played_at }) => new Date(played_at) > lastListened.played_at
      )
    : items

  if (!notRecordedItems.length) return

  const history = notRecordedItems
    .map((item) => ({
      played_at: new Date(item.played_at),
      track_id: item.track.id,
    }))
    .reverse()

  const newEntities = await removeExistingItems(notRecordedItems)

  if (!newEntities.length) {
    await controllers.user.updateHistory(user.id, history)
    await updateUserHistory(user, limit, furtherTrackingInfo)
    return
  }

  const { trackIds, albumIds, artistIds } = await getEntitiesIds(newEntities)

  const newTracks = trackIds.map(
    (trackId) => newEntities.find(({ track }) => track.id === trackId)!.track
  )

  const [features, newAlbums, newArtists] = await Promise.all([
    spotifyAPI.audioFeatures(user.access_token, trackIds),
    albumIds.length
      ? spotifyAPI.albums(user.access_token, albumIds)
      : { albums: [] },
    artistIds.length
      ? spotifyAPI.artists(user.access_token, artistIds)
      : { artists: [] },
  ])

  await Promise.all([
    controllers.album.createMany(newAlbums.albums),
    controllers.artist.createMany(newArtists.artists),
  ])

  await controllers.track.createMany(newTracks)

  await Promise.all([
    controllers.audioFeatures.createMany(features.audio_features),
    controllers.user.updateHistory(user.id, history),
  ])

  await updateUserHistory(user, limit, furtherTrackingInfo)
}

async function getEntitiesIds(items: Item[]) {
  const uniqTrackIds = new Set(items.map(({ track }) => track.id))
  const uniqAlbumIds = new Set(items.map(({ track }) => track.album.id))
  const uniqArtistIds = new Set(
    items.flatMap(({ track }) => [
      ...track.artists.map((artist) => artist.id),
      ...track.album.artists.map((artist) => artist.id),
    ])
  )

  const [albumIds, artistIds] = await Promise.all([
    removeExistingAlbums([...uniqAlbumIds]),
    removeExistingArtists([...uniqArtistIds]),
  ])

  return { trackIds: [...uniqTrackIds], albumIds, artistIds }
}

async function removeExistingItems(items: Item[]) {
  const tracks = items.map(({ track }) => track.id)
  const existingItems = new Set(await controllers.track.checkMany(tracks))

  const newItems = items.filter(({ track }) => !existingItems.has(track.id))
  return newItems
}

async function removeExistingAlbums(albums: string[]) {
  const existingAlbums = new Set(await controllers.album.checkMany(albums))

  const newAlbums = albums.filter((album) => !existingAlbums.has(album))
  return newAlbums
}

async function removeExistingArtists(artists: string[]) {
  const existingArtists = new Set(await controllers.artist.checkMany(artists))

  const newArtists = artists.filter((artist) => !existingArtists.has(artist))
  return newArtists
}
