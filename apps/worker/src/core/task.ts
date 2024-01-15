import { getTimeDiffSeconds, log, error } from "@circles/utils"
import { type Job } from "@circles/types"

type DummyJob = Job<any>

export class WorkerTask {
  name = "unnamed"

  constructor(name: string) {
    this.name = name
  }

  async create(): Promise<DummyJob[]> {
    error(`${this.name} create() not implemented`)

    return []
  }

  async execute(_: DummyJob) {
    throw new Error(`execute() not implemented`)
  }

  async run(job: DummyJob) {
    const start = new Date()

    try {
      await this.execute(job)
    } catch (e) {
      error(`${this.name} job '${job.jobId}' failed: ${(e as Error).message}`)
      return
    }

    const end = new Date()

    const time = getTimeDiffSeconds(start, end)

    log(`${this.name} job '${job.jobId}' executed in ${time}s`)
  }
}

export interface WorkerTaskConstructor {
  new (): WorkerTask
}
