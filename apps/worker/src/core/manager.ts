import { WorkerTask, type WorkerTaskConstructor, type Job } from "./task"

type ManagerStatus = "busy" | "free"

export class WorkerManager {
  tasks = new Map<string, WorkerTask>()
  jobQueue = new Map<string, Job<any>>()
  status: ManagerStatus = "free"

  constructor() {}

  registerTask(task: WorkerTaskConstructor) {
    const handler = new task()
    this.tasks.set(handler.name, handler)
  }

  runNextJob() {
    this.status = "busy"

    const nextJobKey = this.jobQueue.keys().next().value as string

    const [taskName] = nextJobKey.split(":::")
    const job = this.jobQueue.get(nextJobKey)

    if (!job) {
      this.runNextJob()
      return
    }

    this.jobQueue.delete(nextJobKey)

    this.tasks.get(taskName)?.run(job)

    if (!this.jobQueue.size) {
      this.status = "free"
      return
    }

    this.runNextJob()
  }

  enqueueJob(taskName: string, job: Job<any>) {
    if (!this.tasks.has(taskName)) {
      throw new Error(`Unknown task - ${taskName}`)
    }

    const { jobId } = job
    this.jobQueue.set(`${taskName}:::${jobId}`, job)

    if (this.status === "free") {
      this.runNextJob()
    }
  }

  destroy() {
    this.tasks.clear()
    this.jobQueue.clear()
  }
}
