import type { Cursors } from "@circles/types"
import { controllers } from "../../services/database"
import { spotifyAPI } from "../../services/spotify-api"
import { extractEntitiesIds, createHistoryStorage } from "../../helpers"
import { WorkerTask, type Job } from "../../core/task"
import type { UserInfo } from "../../types"

export type HistoryParserJob = Job<{
  id: UserInfo["id"]
  access_token: UserInfo["access_token"]
  lastHistoryRecord: UserInfo["lastHistoryRecord"]
}>

export class SpotifyHistoryParser extends WorkerTask {
  constructor() {
    super("spotify::history-parser")
  }

  async create(): Promise<HistoryParserJob[]> {
    const users = await controllers.task.getUsersInfo()

    return users.map((user) => {
      const { refresh_token, ...jobInfo } = user

      return { jobId: jobInfo.id, args: jobInfo }
    })
  }

  async execute(job: HistoryParserJob) {
    const { args: user } = job

    const tempStorage = createHistoryStorage()

    collectUserHistory(tempStorage, user)

    await tempStorage.cleanEntityDuplicates()

    const newInfo = await spotifyAPI.fetchEntities(
      user.access_token,
      tempStorage.getEntities()
    )

    const history = tempStorage.getHistory()

    await controllers.task.updateDatabase({
      userId: user.id,
      history,
      features: newInfo.features.filter(Boolean),
      tracks: newInfo.tracks,
      albums: newInfo.albums,
      artists: newInfo.artists,
    })
  }
}

async function collectUserHistory(
  tempStorage: ReturnType<typeof createHistoryStorage>,
  user: Omit<UserInfo, "refresh_token">,
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

  tempStorage.addHistory(history)

  const newItems = await controllers.track.filterExistingItems(unrecordedItems)

  if (newItems.length) {
    const { trackIds, albumIds, artistIds } = extractEntitiesIds(newItems)
    tempStorage.addEntities({ trackIds, albumIds, artistIds, userId: user.id })
  }

  await collectUserHistory(tempStorage, user, limit, cursors.before)
}
