import { UniqPriorityQueue } from "@circles/utils"
import { type Job } from "@circles/types"
import { WorkerTask, type WorkerTaskConstructor } from "./task"
import { MAX_WORKER_LOAD } from "../config"

export class WorkerManager {
  private load: number
  private isFree: boolean
  private tasks: Map<string, WorkerTask>
  private jobQueue: UniqPriorityQueue<{
    weight: number
    taskName: string
    job: Job<any>
  }>

  constructor() {
    this.load = 0
    this.isFree = true
    this.tasks = new Map()
    this.jobQueue = new UniqPriorityQueue()
  }

  status() {
    return {
      load: this.load,
      isFree: this.isFree,
      jobs: this.jobQueue.size(),
    }
  }

  registerTaskHandler(task: WorkerTaskConstructor) {
    const handler = new task()
    this.tasks.set(handler.name, handler)
  }

  getTaskHandler(taskName: string) {
    return this.tasks.get(taskName)
  }

  tasksList() {
    return [...this.tasks.keys()]
  }

  async runNextJob() {
    const order = this.jobQueue.dequeue()

    if (!order) return

    const { job, weight, taskName } = order

    await this.tasks.get(taskName)!.run(job)
    this.load -= weight

    this.runNextJob()
  }

  async enqueueJob(
    taskName: string,
    weight: number,
    job: Job<any>,
    priority = 0
  ) {
    if (!this.tasks.has(taskName)) {
      throw new Error(`Unknown task - ${taskName}`)
    }

    if (this.load + weight > MAX_WORKER_LOAD) {
      throw new Error(`Exceeded max allowed load`)
    }

    const { jobId } = job
    this.jobQueue.enqueue(
      `${taskName}:::${jobId}`,
      { job, weight, taskName },
      priority
    )
    this.load += weight

    if (this.isFree) {
      this.isFree = false
      await this.runNextJob()
      this.isFree = true
    }
  }

  destroy() {
    this.tasks.clear()
    this.jobQueue.clear()
  }
}
