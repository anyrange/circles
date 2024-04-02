import "@total-typescript/ts-reset"

import { Scheduler } from "./core/scheduler"
import { SCHEDULER_SYNC_INTERVAL } from "./config"

const scheduler = new Scheduler(SCHEDULER_SYNC_INTERVAL)
