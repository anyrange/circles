import {
  fetchRecentlyPlayed,
  fetchTracks,
  fetchAlbums,
  fetchArtists,
  fetchAudioFeatures,
} from "@circles/spotify-api"
import { controllers } from "@circles/database"
import {
  removeStoredTracks,
  makeBatchRequests,
  extractEntitiesIds,
  createHistoryStorage,
} from "../helpers"
import { createTask } from "../core"
import { API_ALBUM_CAPACITY } from "../config"

import type { Cursors } from "@circles/types"
import type { UserOptions } from "../types"

const tempStorage = createHistoryStorage()
let lastToken = ""

export const parseHistory = createTask({
  executeForEachUser: collectUserHistory,
  onFinished: () => finishHistoryParsing(lastToken),
})

export async function collectUserHistory(
  user: UserOptions,
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
    tempStorage.addHistory(user.id, history)
    await collectUserHistory(user, limit, cursors.before)
    return
  }

  const { trackIds, albumIds, artistIds } = await extractEntitiesIds(newItems)

  tempStorage.addEntities({ trackIds, albumIds, artistIds })
  tempStorage.addHistory(user.id, history)

  lastToken = user.access_token

  await collectUserHistory(user, limit, cursors.before)
}

export async function finishHistoryParsing(access_token: string) {
  const { trackIds, albumIds, artistIds } = await tempStorage.getEntities()

  const [features, newTracks, newAlbums, newArtists] = await Promise.all([
    makeBatchRequests(
      async (ids) =>
        fetchAudioFeatures(access_token, ids).then(
          ({ audio_features }) => audio_features
        ),
      trackIds
    ),
    makeBatchRequests(
      async (ids) =>
        fetchTracks(access_token, ids).then(({ tracks }) => tracks),
      trackIds
    ),
    makeBatchRequests(
      async (ids) =>
        fetchAlbums(access_token, ids).then(({ albums }) => albums),
      albumIds,
      API_ALBUM_CAPACITY
    ),
    makeBatchRequests(
      async (ids) =>
        fetchArtists(access_token, ids).then(({ artists }) => artists),
      artistIds
    ),
  ])

  const histories = tempStorage.getHistories()

  await controllers.task.updateDatabase({
    albums: newAlbums,
    artists: newArtists,
    tracks: newTracks,
    features,
    histories,
  })

  tempStorage.clearStorage()
}
