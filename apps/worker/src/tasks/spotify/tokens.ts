import { controllers } from "../../services/database"
import { refreshTokens } from "../../services/spotify-api"
import { WorkerTask, type Job } from "../../core/task"
import type { UserInfo } from "../../types"

export type TokenParserJob = Job<{
  id: UserInfo["id"]
  refresh_token: UserInfo["refresh_token"]
}>

export class SpotifyTokensParser extends WorkerTask {
  constructor() {
    super("spotify::tokens-parser")
  }

  async create(): Promise<TokenParserJob[]> {
    const users = await controllers.general.getUsersInfo()

    return users.map((user) => {
      const { lastHistoryRecord, access_token, ...jobInfo } = user

      return { jobId: jobInfo.id, args: jobInfo }
    })
  }

  async execute(job: TokenParserJob) {
    const { args: user } = job

    const tokenUpdate = await refreshTokens(user)

    await controllers.user.updateAccessToken(tokenUpdate)

    if (!tokenUpdate.is_active) {
      throw new Error(`User ${user.id} has revoked the access`)
    }
  }
}
