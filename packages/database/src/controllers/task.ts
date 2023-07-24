import { desc, eq } from "drizzle-orm"
import { history } from "../schema"
import type { DB } from "../schema"
import type { UpdateInfo } from "../types"
import { createAlbumController } from "./album"
import { createArtistController } from "./artist"
import { createTrackController } from "./track"
import { createAudioFeaturesController } from "./audioFeatures"

export const createTaskController = (db: DB) => {
  const getUsersInfo = async () => {
    const usersList = await db.query.users.findMany({
      columns: {
        id: true,
        access_token: true,
        refresh_token: true,
      },
      with: {
        history: {
          limit: 1,
          orderBy: desc(history.played_at),
        },
      },
      where: (users) => eq(users.refresh_is_valid, true),
    })

    return usersList.map((user) => ({
      id: user.id,
      refresh_token: user.refresh_token,
      access_token: user.access_token,
      lastHistoryRecord: user.history[0] || undefined,
    }))
  }

  const updateDatabase = async (data: UpdateInfo) => {
    const newRecords = data.histories.filter(({ history }) => history.length)

    const isEmpty = !(
      data.albums.length ||
      data.artists.length ||
      data.tracks.length ||
      data.features.length ||
      newRecords.length
    )

    if (isEmpty) return

    return db.transaction(async (tx) => {
      const albums = createAlbumController(tx)
      const artists = createArtistController(tx)
      const tracks = createTrackController(tx)
      const audioFeatures = createAudioFeaturesController(tx)

      await albums.createMany(data.albums)
      await artists.createMany(data.artists)
      await tracks.createMany(data.tracks)
      await audioFeatures.createMany(data.features)

      await Promise.all(
        newRecords.map(({ userId, history: listeningHistory }) =>
          db.insert(history).values(
            listeningHistory.map(({ played_at, track_id }) => ({
              user_id: userId,
              played_at,
              track_id,
            }))
          )
        )
      )
    })
  }

  return {
    getUsersInfo,
    updateDatabase,
  }
}
