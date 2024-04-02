import { error, minuteInMs, secondInMs } from "@circles/utils"
import * as dotenv from "dotenv"

dotenv.config({ path: "../../.env" })

if (typeof process.env.MONGO_URL !== "string") {
  error("MONGO_URL must be defined in env")
  process.exit(1)
}

export const { MONGO_URL } = process.env

export const BALANCER_SYNC_INTERVAL = minuteInMs
export const SCHEDULER_SYNC_INTERVAL = minuteInMs
export const WORKER_SYNC_INTERVAL = 5 * secondInMs
export const JOBS_SYNC_INTERVAL = minuteInMs
