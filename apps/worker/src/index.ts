import cron from "node-cron"
import { log } from "./utils"
import { refreshTokens, parseHistory } from "./tasks"

log("Starting workers")

refreshTokens().then((res) =>
  log(`Initial refresh: ${res.fullfilled}/${res.overall} in ${res.time}s`)
)

cron.schedule("*/30 * * * *", async () => {
  const res = await refreshTokens()
  log(`Refreshing tokens: ${res.fullfilled}/${res.overall} in ${res.time}s`)
})

cron.schedule("*/5 * * * *", async () => {
  const res = await parseHistory()
  log(`Parsing tracks: ${res.fullfilled}/${res.overall} in ${res.time}s`)
})

export {
  collectUserHistory,
  finishHistoryParsing,
  updateUserTokens,
} from "./tasks"
