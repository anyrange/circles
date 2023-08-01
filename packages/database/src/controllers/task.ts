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

    return db.transaction(
      async (tx) => {
        await createAlbumController(tx).createMany(data.albums)
        await createArtistController(tx).createMany(data.artists)
        await createTrackController(tx).createMany(data.tracks)
        await createAudioFeaturesController(tx).createMany(data.features)

        newRecords.forEach(async ({ userId, history: listeningHistory }) => {
          await db.insert(history).values(
            listeningHistory.map(({ played_at, track_id }) => ({
              user_id: userId,
              played_at,
              track_id,
            }))
          )
        })
      },
      {
        deferrable: true,
      }
    )
  }

  return {
    getUsersInfo,
    updateDatabase,
  }
}
