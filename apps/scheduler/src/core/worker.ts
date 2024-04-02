import { log } from "@circles/utils"
import { WorkerRequest } from "./request"

export class Worker {
  name: string
  host: string
  port: number

  capacity: number
  currentLoad: null | number

  syncInterval: number
  syncTimeout: NodeJS.Timeout

  destroyed: boolean

  constructor(
    syncInterval: number,
    name: string,
    host: string,
    port: number,
    capacity: number
  ) {
    this.name = name
    this.host = host
    this.port = port

    this.capacity = capacity
    this.currentLoad = null

    this.syncInterval = syncInterval
    this.syncTimeout = setTimeout(this.syncLoadLimiter.bind(this), 0)

    this.destroyed = false
  }

  async syncLoadLimiter() {
    try {
      const { load } = await new WorkerRequest(this).status()

      if (this.destroyed) return

      this.currentLoad = load
    } catch (e) {
      log(`worker::sync-fail::${this.name} ${(e as Error).message}`)
      this.currentLoad = null
    }

    if (this.destroyed) return

    this.syncTimeout = setTimeout(
      this.syncLoadLimiter.bind(this),
      this.syncInterval - (Date.now() % this.syncInterval)
    )
  }

  destroy() {
    this.destroyed = true
    clearTimeout(this.syncTimeout)
  }
}
