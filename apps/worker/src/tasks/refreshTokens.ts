import { controllers } from "@circles/database"
import { fetchTokens } from "@circles/spotifyAPI"
import { taskBase } from "../core"

import type { TaskOptions } from "../core"

export default taskBase(updateUserTokens)

export function updateUserTokens({ refresh_token, id }: TaskOptions) {
  fetchTokens({ refresh_token }).then(({ access_token }) =>
    controllers.user.updateTokens(id, access_token)
  )
}
