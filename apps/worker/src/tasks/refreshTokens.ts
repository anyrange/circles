import { controllers } from "@circles/database"
import { fetchTokens } from "@circles/spotify-api"
import { createTask } from "../core"

import type { TaskOptions } from "../types"

export const refreshTokens = createTask(updateUserTokens)

export function updateUserTokens({ refresh_token, id }: TaskOptions) {
  fetchTokens({ refresh_token }).then(({ access_token }) =>
    controllers.user.updateTokens(id, access_token)
  )
}
