import { isPromiseFulfilled, isPromiseRejected, error } from "@circles/utils"
import { controllers } from "../services/database"
import { spotifyAPI } from "../services/spotify-api"
import { createTask } from "../core"

import type { UserInfo } from "../types"

const REVOKED_MESSAGE = "Refresh token revoked"

export const refreshTokens = createTask(async (usersInfo) => {
  const results = await Promise.allSettled(
    usersInfo.map((user) => getNewToken(user))
  )

  const failedTasks = results.filter(isPromiseRejected)
  const newTokens = results.filter(isPromiseFulfilled).map(({ value }) => value)

  await controllers.user.updateAccessTokens(newTokens)

  return { failedTasks, fulfilled: newTokens.length }
})

export async function getNewToken({ refresh_token, id }: UserInfo) {
  try {
    const { access_token } = await spotifyAPI.fetchTokens({ refresh_token })

    return { access_token, id, is_active: true }
  } catch (e) {
    if ((e as Error).message !== REVOKED_MESSAGE) throw e

    error(`User ${id} has revoked the token`)

    return { access_token: "", id, is_active: false }
  }
}
