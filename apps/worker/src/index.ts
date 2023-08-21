import "@total-typescript/ts-reset"
import { schedule } from "node-cron"
import { log } from "@circles/utils"
import { refreshTokens, parseHistory } from "./tasks"

log("Starting workers")

refreshTokens().then((res) =>
  log(`Initial token refresh: ${res.fulfilled}/${res.overall} in ${res.time}s`)
)

schedule("*/30 * * * *", async () => {
  const res = await refreshTokens()
  log(`Refreshing tokens: ${res.fulfilled}/${res.overall} in ${res.time}s`)
})

schedule("*/5 * * * *", async () => {
  const res = await parseHistory()
  log(`Parsing tracks: ${res.fulfilled}/${res.overall} in ${res.time}s`)
})

export { collectUserHistory } from "./tasks"
