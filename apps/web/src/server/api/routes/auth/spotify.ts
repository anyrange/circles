import { z } from "zod"
import {
  fetchMe,
  fetchTokens,
  fetchRecentlyPlayed,
  fetchEntities,
} from "@circles/spotify-api"
import { controllers } from "@circles/database"
import { uniquifyArray, error } from "@circles/utils"
import { publicProcedure } from "~~/server/trpc"
import { extractEntitiesIds, getRedirectURI } from "~~/helpers"

export const spotify = publicProcedure
  .input(
    z.object({
      code: z.string(),
    })
  )
  .query(async ({ input }) => {
    const { access_token, refresh_token } = await fetchTokens({
      code: input.code,
      redirectURI: getRedirectURI(),
    })

    const me = await fetchMe(access_token)

    const user = await controllers.user.upsert({
      ...me,
      access_token,
      refresh_token,
    })

    const isNewUser =
      user.last_login.getTime() === user.registration_date.getTime()

    if (isNewUser)
      await parseUserHistory(user.id, access_token).catch((e) =>
        error(`Couldn't parse ${user.display_name}: ${e}`)
      )

    return user
  })

const PARSE_LIMIT = 50

async function parseUserHistory(id: string, token: string) {
  const { items } = await fetchRecentlyPlayed(token, PARSE_LIMIT)

  if (!items.length) return

  const history = items
    .map((item) => ({
      played_at: new Date(item.played_at),
      track_id: item.track.id,
    }))
    .reverse()

  const uniqItems = await controllers.track.filterExistingItems(items)
  const entitiesIds = extractEntitiesIds(uniqItems)

  const [albumIds, artistIds] = await Promise.all([
    controllers.album.filterExistingAlbumIds(
      uniquifyArray(entitiesIds.albumIds)
    ),
    controllers.artist.filterExistingArtistIds(
      uniquifyArray(entitiesIds.artistIds)
    ),
  ])

  const { features, tracks, albums, artists } = await fetchEntities(token, {
    trackIds: uniquifyArray(entitiesIds.trackIds),
    albumIds,
    artistIds,
  })

  await controllers.task.updateDatabase({
    histories: [{ userId: id, history }],
    features,
    tracks,
    albums,
    artists,
  })
}
