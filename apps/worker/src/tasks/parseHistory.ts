import { isPromiseFulfilled, isPromiseRejected } from "@circles/utils"
import { controllers } from "../services/database"
import { spotifyAPI } from "../services/spotify-api"
import type {
  Cursors,
  ExtendedAlbum,
  ExtendedArtist,
  AudioFeature,
  Track,
} from "@circles/types"
import { extractEntitiesIds, createHistoryStorage } from "../helpers"
import { createTask } from "../core"
import type { UserInfo } from "../types"

const tempStorage = createHistoryStorage()

export const parseHistory = createTask(async (usersInfo) => {
  tempStorage.clearStorage()

  const results = await Promise.allSettled(
    usersInfo.map((user) => collectUserHistory(user))
  )

  const failedTasks = results.filter(isPromiseRejected)

  await tempStorage.cleanEntityDuplicates()

  const newInfo = await Promise.allSettled(
    tempStorage
      .getEntitiesUpdates()
      .map((update) => spotifyAPI.fetchEntities(update.token, update))
  )

  failedTasks.push(...newInfo.filter(isPromiseRejected))

  const features: AudioFeature[] = []
  const tracks: Track[] = []
  const albums: ExtendedAlbum[] = []
  const artists: ExtendedArtist[] = []

  newInfo.filter(isPromiseFulfilled).forEach(({ value }) => {
    features.push(...value.features)
    tracks.push(...value.tracks)
    albums.push(...value.albums)
    artists.push(...value.artists)
  })

  const histories = tempStorage.getHistories()

  await controllers.task.updateDatabase({
    histories,
    features,
    tracks,
    albums,
    artists,
  })

  return { failedTasks, fulfilled: usersInfo.length - failedTasks.length }
})

export async function collectUserHistory(
  user: UserInfo,
  limit = 5,
  beforeCursor?: Cursors["before"]
) {
  const isBackTracking = !!beforeCursor

  const { items, cursors } = await spotifyAPI.fetchRecentlyPlayed(
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

  const newItems = await controllers.track.filterExistingItems(unrecordedItems)

  if (!newItems.length) {
    tempStorage.addHistory(user.id, history, user.access_token)
    await collectUserHistory(user, limit, cursors.before)
    return
  }

  const { trackIds, albumIds, artistIds } = extractEntitiesIds(newItems)

  tempStorage.addHistory(user.id, history, user.access_token)
  tempStorage.addEntities({ trackIds, albumIds, artistIds, userId: user.id })

  await collectUserHistory(user, limit, cursors.before)
}
