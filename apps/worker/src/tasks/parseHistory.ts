import { controllers } from "@circles/database"
import { isPromiseFulfilled, isPromiseRejected } from "@circles/utils"
import {
  fetchRecentlyPlayed,
  fetchTracks,
  fetchAlbums,
  fetchArtists,
  fetchAudioFeatures,
} from "@circles/spotify-api"
import {
  removeStoredTracks,
  makeBatchRequests,
  extractEntitiesIds,
  createHistoryStorage,
} from "../helpers"
import { createTask } from "../core"
import { API_ALBUM_CAPACITY } from "../config"

import type {
  Cursors,
  ExtendedAlbum,
  ExtendedArtist,
  AudioFeature,
  Track,
} from "@circles/types"
import type { UserInfo, StorageItem } from "../types"

const tempStorage = createHistoryStorage()

export const parseHistory = createTask(async (usersInfo) => {
  const results = await Promise.allSettled(
    usersInfo.map((user) => collectUserHistory(user))
  )

  const failedTasks = results.filter(isPromiseRejected)

  await tempStorage.cleanEntityDuplicates()

  const newInfo = await Promise.allSettled(
    tempStorage.getEntitiesUpdates().map((update) => fetchEntities(update))
  )

  failedTasks.push(...newInfo.filter(isPromiseRejected))

  const features: AudioFeature[] = []
  const tracks: Track[] = []
  const albums: ExtendedAlbum[] = []
  const artists: ExtendedArtist[] = []

  newInfo.filter(isPromiseFulfilled).forEach(({ value }) => {
    features.push(...value.features)
    tracks.push(...value.newTracks)
    albums.push(...value.newAlbums)
    artists.push(...value.newArtists)
  })

  const histories = tempStorage.getHistories()

  await controllers.task.updateDatabase({
    histories,
    features,
    tracks,
    albums,
    artists,
  })

  tempStorage.clearStorage()

  return { failedTasks, fullfilled: usersInfo.length - failedTasks.length }
})

export async function collectUserHistory(
  user: UserInfo,
  limit = 5,
  beforeCursor?: Cursors["before"]
) {
  const isBackTracking = !!beforeCursor

  const { items, cursors } = await fetchRecentlyPlayed(
    user.access_token,
    limit,
    isBackTracking ? { before: beforeCursor } : {}
  )

  if (!items.length) return

  const lastRecord = user.lastHistoryRecord

  const unrecordedItems = lastRecord
    ? items.filter(
        ({ played_at }) => new Date(played_at) > lastRecord.played_at
      )
    : items

  if (!unrecordedItems.length) return

  const history = unrecordedItems
    .map((item) => ({
      played_at: new Date(item.played_at),
      track_id: item.track.id,
    }))
    .reverse()

  const newItems = await removeStoredTracks(unrecordedItems)

  if (!newItems.length) {
    tempStorage.addHistory(user.id, history, user.access_token)
    await collectUserHistory(user, limit, cursors.before)
    return
  }

  const { trackIds, albumIds, artistIds } = await extractEntitiesIds(newItems)

  tempStorage.addHistory(user.id, history, user.access_token)
  tempStorage.addEntities({ trackIds, albumIds, artistIds, userId: user.id })

  await collectUserHistory(user, limit, cursors.before)
}

export async function fetchEntities({
  token,
  trackIds,
  albumIds,
  artistIds,
}: Omit<StorageItem, "history">) {
  const [features, newTracks, newAlbums, newArtists] = await Promise.all([
    makeBatchRequests(
      async (ids) =>
        fetchAudioFeatures(token, ids).then(
          ({ audio_features }) => audio_features
        ),
      trackIds
    ),
    makeBatchRequests(
      async (ids) => fetchTracks(token, ids).then(({ tracks }) => tracks),
      trackIds
    ),
    makeBatchRequests(
      async (ids) => fetchAlbums(token, ids).then(({ albums }) => albums),
      albumIds,
      API_ALBUM_CAPACITY
    ),
    makeBatchRequests(
      async (ids) => fetchArtists(token, ids).then(({ artists }) => artists),
      artistIds
    ),
  ])

  return { features, newTracks, newAlbums, newArtists }
}
