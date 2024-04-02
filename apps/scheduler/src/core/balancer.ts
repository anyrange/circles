import { isDefined } from "@circles/utils"
import { db } from "../services/database"
import { WORKER_SYNC_INTERVAL } from "../config"
import { Worker } from "./worker"

export class Balancer {
  workers: Map<string, Worker>
  lookupIdx: number

  syncInterval: number
  syncTimeout: NodeJS.Timeout

  destroyed: boolean

  constructor(syncInterval: number) {
    this.workers = new Map()
    this.lookupIdx = 0

    this.syncInterval = syncInterval
    this.syncTimeout = setTimeout(this.syncWorkers.bind(this), 0)

    this.destroyed = false
  }

  availableWorkers() {
    return this.workers.size
  }

  async syncWorkers() {
    const nextWorkers = await (await db).worker.list()

    if (this.destroyed) return

    const workersCopy = new Set(this.workers.keys())

    for (const worker of nextWorkers) {
      const name = String(worker._id)

      if (this.workers.has(name)) {
        workersCopy.delete(name)

        const oldWorker = this.workers.get(name)!

        oldWorker.capacity = worker.capacity
      } else {
        this.workers.set(
          name,
          new Worker(
            WORKER_SYNC_INTERVAL,
            name,
            worker.host,
            worker.port,
            worker.capacity
          )
        )
      }
    }

    for (const removedWorker of workersCopy) {
      this.workers.get(removedWorker)?.destroy()
      this.workers.delete(removedWorker)
    }

    this.syncTimeout = setTimeout(
      this.syncWorkers.bind(this),
      this.syncInterval - (Date.now() % this.syncInterval)
    )
  }

  select(weight = 0) {
    const size = this.workers.size

    const workers = [...this.workers.values()]

    for (let addIdx = 1; addIdx <= size; addIdx += 1) {
      const idx = (this.lookupIdx + addIdx) % size

      const worker = workers[idx]

      if (
        weight > 0 &&
        (!isDefined(worker.currentLoad) ||
          worker.capacity - worker.currentLoad <= weight)
      )
        continue

      this.lookupIdx = idx

      return worker
    }

    return null
  }

  destroy() {
    this.destroyed = true
    clearTimeout(this.syncTimeout)

    this.workers.forEach((worker) => worker.destroy())
  }
}
