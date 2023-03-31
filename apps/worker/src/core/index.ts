import { controllers } from "@circles/database"
import { getTimeDiffSeconds, error } from "@circles/utils"

import type { TaskFn } from "../types"

export function createTask(taskFn: TaskFn) {
  return async () => {
    try {
      const users = await controllers.task.getUsersInfo()

      const start = new Date()

      const { fullfilled, failedTasks } = await taskFn(users).catch((e) => {
        error((e as Error).message)
        return { fullfilled: 0, failedTasks: [] }
      })

      const end = new Date()

      failedTasks.forEach(({ reason }) => error((reason as Error).message))

      const time = getTimeDiffSeconds(start, end)

      return { fullfilled, overall: users.length, time }
    } catch (e) {
      error((e as Error).message)
      return { fullfilled: 0, overall: 0, time: 0 }
    }
  }
}
