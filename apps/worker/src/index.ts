import cron from "node-cron"
import prisma from "@circles/database"

import { log } from "./utils"
import { refreshTokens, parseHistory } from "./tasks"

const CRON_OPTIONS = {
  runOnInit: true,
}

async function main() {
  try {
    log("Starting workers")

    cron.schedule(
      "*/30 * * * *",
      async () => {
        const res = await refreshTokens()
        log(
          `Refreshing tokens: ${res.fullfilled}/${res.overall} in ${res.time}s`
        )
      },
      CRON_OPTIONS
    )

    cron.schedule("*/3 * * * *", async () => {
      const res = await parseHistory()
      log(`Parsing tracks: ${res.fullfilled}/${res.overall} in ${res.time}s`)
    })

    await prisma.$disconnect()
  } catch (e) {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }
}

main().then()

export { functions } from "./tasks"
