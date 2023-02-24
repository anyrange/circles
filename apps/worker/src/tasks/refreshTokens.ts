import { controllers } from "@circles/database"
import { fetchTokens } from "@circles/spotify-api"
import { createTask } from "../core"

import type { UserOptions } from "../types"

export const refreshTokens = createTask({
  executeForEachUser: getNewToken,
  handleExecutionResults: controllers.user.updateManyTokens,
})

export async function getNewToken({ refresh_token, id }: UserOptions) {
  const { access_token } = await fetchTokens({ refresh_token })

  return { access_token, id }
}
