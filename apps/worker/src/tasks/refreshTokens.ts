import { controllers } from "@circles/database"
import { fetchTokens } from "@circles/spotify-api"
import { isPromiseFulfilled, isPromiseRejected } from "@circles/utils"
import { createTask } from "../core"

import type { UserInfo } from "../types"

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
  const { access_token } = await fetchTokens({ refresh_token })

  return { access_token, id }
}
