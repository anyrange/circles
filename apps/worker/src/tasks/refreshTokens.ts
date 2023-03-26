import { controllers } from "@circles/database"
import { fetchTokens } from "@circles/spotify-api"
import { isPromiseFulfilled, isPromiseRejected, error } from "@circles/utils"
import { createTask } from "../core"

import type { UserInfo } from "../types"

const REVOKED_MESSAGE = "Refresh token revoked"

export const refreshTokens = createTask(async (usersInfo) => {
  const results = await Promise.allSettled(
    usersInfo.map((user) => getNewToken(user))
  )

  const failedTasks = results.filter(isPromiseRejected)
  const newTokens = results.filter(isPromiseFulfilled).map(({ value }) => value)

  await controllers.user.updateManyTokens(newTokens)

  return { failedTasks, fullfilled: newTokens.length }
})

export async function getNewToken({ refresh_token, id }: UserInfo) {
  try {
    const { access_token } = await fetchTokens({ refresh_token })

    return { access_token, id, refresh_is_valid: true }
  } catch (e) {
    if ((e as Error).message !== REVOKED_MESSAGE) throw e

    error(`User ${id} has revoked the token`)

    return { access_token: "", id, refresh_is_valid: false }
  }
}
