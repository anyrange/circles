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

import type { Cursors, HistoryRecord } from "@circles/types"
import type { TaskOptions } from "../types"

const tempStorage = createHistoryStorage()
let lastToken = ""

export async function parseHistory() {
  try {
    const collectAllHistories = createTask(collectUserHistory)

    const res = await collectAllHistories()

    await finishHistoryParsing(lastToken)

    return res
  } catch (err) {
    console.error(err)
    return { fullfilled: 0, overall: 0, time: 0 }
  }
}

export async function collectUserHistory(
  user: TaskOptions,
  limit = 5,
  backtrackingInfo?: {
    cursors: Cursors
    lastHistoryRecord: HistoryRecord | undefined
  }
) {
  const isBackTracking = !!backtrackingInfo

  const { items, cursors: newCursors } = await fetchRecentlyPlayed(
    user.access_token,
    limit,
    isBackTracking ? { before: backtrackingInfo.cursors.before } : {}
  )
  console.log("start:", user.id)

  if (!items.length) return

  const lastListened = backtrackingInfo
    ? backtrackingInfo.lastHistoryRecord
    : await controllers.user.lastListened(user.id)

  const furtherTrackingInfo = {
    cursors: newCursors,
    lastHistoryRecord: lastListened,
  }

  const unrecordedItems = lastListened
    ? items.filter(
        ({ played_at }) => new Date(played_at) > lastListened.played_at
      )
    : items

  if (!unrecordedItems.length) return

  console.log("found:", user.id)

  const history = unrecordedItems
    .map((item) => ({
      played_at: new Date(item.played_at),
      track_id: item.track.id,
    }))
    .reverse()

  const newItems = await removeStoredTracks(unrecordedItems)

  if (!newItems.length) {
    tempStorage.addHistory(user.id, history)
    await collectUserHistory(user, limit, furtherTrackingInfo)
    return
  }

  const { trackIds, albumIds, artistIds } = await extractEntitiesIds(newItems)

  tempStorage.addEntities({ trackIds, albumIds, artistIds })
  tempStorage.addHistory(user.id, history)

  lastToken = user.access_token
  await collectUserHistory(user, limit, furtherTrackingInfo)
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

  await Promise.all([
    controllers.album.createMany(newAlbums),
    controllers.artist.createMany(newArtists),
  ])

  await controllers.track.createMany(newTracks)
  await controllers.audioFeatures.createMany(features)

  const histories = tempStorage.getHistories()

  const updateUsers = histories.map(({ userId, history }) =>
    controllers.user.updateHistory(userId, history)
  )

  await Promise.all(updateUsers)

  tempStorage.clearStorage()
}
