import { BALANCER_SYNC_INTERVAL, JOBS_SYNC_INTERVAL } from "../config"
import { db } from "../services/database"
import { Balancer } from "./balancer"
import { Task } from "./task"

export class Scheduler {
  tasks: Map<string, Task>

  balancer: Balancer

  tasksSyncInterval: number
  syncTimout: NodeJS.Timeout

  destroyed: Boolean

  constructor(tasksSyncInterval: number) {
    this.tasks = new Map()

    this.balancer = new Balancer(BALANCER_SYNC_INTERVAL)

    this.tasksSyncInterval = tasksSyncInterval
    this.syncTimout = setTimeout(this.syncTasks.bind(this), 0)

    this.destroyed = false
  }

  async syncTasks() {
    const nextTasks = await (await db).task.list()

    if (this.destroyed) return

    // Avoiding race condition
    const tasksCopy = new Set(this.tasks.keys())
    for (const task of nextTasks) {
      if (this.tasks.has(task.name)) {
        tasksCopy.delete(task.name)

        const oldTask = this.tasks.get(task.name)!

        oldTask.updateParams(
          task.minExecutionInterval,
          task.weight,
          task.priority,
          JOBS_SYNC_INTERVAL
        )
      } else {
        this.tasks.set(
          task.name,
          new Task(
            task.name,
            task.minExecutionInterval,
            task.priority,
            task.weight,
            JOBS_SYNC_INTERVAL,
            this.balancer
          )
        )
      }
    }

    for (const removedTaskName of tasksCopy) {
      const removedTask = this.tasks.get(removedTaskName)

      removedTask?.destroy()

      this.tasks.delete(removedTaskName)
    }

    this.syncTimout = setTimeout(
      this.syncTasks.bind(this),
      this.tasksSyncInterval - (Date.now() % this.tasksSyncInterval)
    )
  }

  destroy() {
    this.destroyed = true

    clearTimeout(this.syncTimout)

    this.tasks.forEach((task) => task.destroy())
    this.balancer.destroy()
  }
}
