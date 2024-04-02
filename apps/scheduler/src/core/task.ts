import { UniqQueue, error, log, isDefined, secondInMs } from "@circles/utils"
import { Job } from "@circles/types"
import { Balancer } from "./balancer"
import { WorkerRequest } from "./request"

export class Task {
  name: string
  weight: number
  priority: number

  jobs: Map<string, Job<any>>

  balancer: Balancer
  deferred: UniqQueue<string>
  seen: Set<string>

  destroyed: boolean

  jobsSyncInterval: number
  syncTimout: NodeJS.Timeout

  minExecutionInterval: number
  procDeferredTimeout: NodeJS.Timeout

  constructor(
    name: string,
    minExecutionInterval: number,
    weight: number,
    priority = 0,
    jobsSyncInterval: number,
    balancer: Balancer
  ) {
    this.name = name
    this.weight = weight
    this.priority = priority

    this.jobs = new Map()

    this.balancer = balancer
    this.deferred = new UniqQueue()
    this.seen = new Set()

    this.jobsSyncInterval = jobsSyncInterval
    this.syncTimout = setTimeout(this.syncJobs.bind(this), 0)

    this.minExecutionInterval = minExecutionInterval
    this.procDeferredTimeout = setTimeout(this.procDeferred.bind(this), 0)

    this.destroyed = false
  }

  updateParams(
    minExecutionInterval: number,
    weight: number,
    priority: number,
    jobsSyncInterval: number
  ) {
    this.minExecutionInterval = minExecutionInterval
    this.weight = weight
    this.priority = priority
    this.jobsSyncInterval = jobsSyncInterval
  }

  reassign(job: Job<any> /* nextRunIn: number */) {
    this.deferred.push(job.jobId, job.jobId)
  }

  async jobRunner(job: Job<any>) {
    log(`beat::${this.name}:::${job.jobId}`)

    const topDeferredTaskId = this.deferred.front()
    const shouldThrottle =
      topDeferredTaskId !== null && topDeferredTaskId !== job.jobId

    const deferNext = () => {
      if (this.seen.has(job.jobId)) {
        this.deferred.push(job.jobId, job.jobId)
      } else {
        this.deferred.pushFront(job.jobId, job.jobId)
      }
    }

    try {
      if (this.destroyed) {
        this.deferred.delete(job.jobId)

        return
      }

      if (shouldThrottle) {
        deferNext()

        return
      }

      const jobWorker = this.balancer.select(this.weight)

      if (!isDefined(jobWorker) || !isDefined(jobWorker.currentLoad)) {
        deferNext()

        return
      }

      jobWorker.currentLoad += this.weight

      await new WorkerRequest(jobWorker).exec(
        this.name,
        job,
        this.weight,
        this.priority
      )

      this.deferred.delete(job.jobId)

      this.seen.add(job.jobId)
    } catch (e) {
      error(`job-runner::${this.name}::${job.jobId} ${(e as Error).message}`)

      this.deferred.delete(job.jobId)
      this.seen.add(job.jobId)

      this.reassign(job)
    }
  }

  async syncJobs() {
    const logInfo = (msg: string) => log(`sync-jobs::${this.name} ${msg}`)

    logInfo("Start")
    const worker = this.balancer.select()

    if (worker === null) {
      logInfo("No workers available")

      this.syncTimout = setTimeout(this.syncJobs.bind(this), 5 * secondInMs)

      return
    }

    try {
      logInfo("Fetch next jobs")

      const nextJobs = await new WorkerRequest(worker).jobs(this.name)

      if (this.destroyed) return

      logInfo(`Jobs number diff ${this.jobs.size} -> ${nextJobs.length}`)

      nextJobs.forEach(({ jobId, args }) => {
        if (this.jobs.has(jobId)) {
          this.jobs.get(jobId)!.args = args
        } else {
          const newJob = { jobId, args }
          this.jobs.set(jobId, newJob)
          this.deferred.push(jobId, jobId)
        }
      })
    } catch (e) {
      error(`sync-jobs::${this.name} ${(e as Error).message}`)
    }

    this.syncTimout = setTimeout(
      this.syncJobs.bind(this),
      this.jobsSyncInterval - (Date.now() % this.jobsSyncInterval)
    )
  }

  async procDeferred() {
    let timeout = 1000

    const topDeferredTaskId = this.deferred.front()
    const topTask = topDeferredTaskId ? this.jobs.get(topDeferredTaskId) : null

    if (topTask) {
      try {
        await this.jobRunner(topTask)
      } finally {
        if (this.balancer.availableWorkers() > 0) {
          timeout = 100
        }
      }
    }

    this.procDeferredTimeout = setTimeout(this.procDeferred.bind(this), timeout)
  }

  destroy() {
    this.destroyed = true
    clearTimeout(this.syncTimout)
    clearTimeout(this.procDeferredTimeout)
  }
}
