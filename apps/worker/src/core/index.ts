import { controllers } from "@circles/database"
import { getTimeDiffSeconds, error } from "@circles/utils"

import type { TaskFn } from "../types"

export function createTask(taskFn: TaskFn) {
  return async () => {
    try {
      const users = await controllers.task.getUsersInfo()

      const start = new Date()

      const { fullfilled, failedTasks } = await taskFn(users)

      const end = new Date()

      failedTasks.forEach(({ reason }) => error(reason))

      const time = getTimeDiffSeconds(start, end)

      return { fullfilled, overall: users.length, time }
    } catch (err) {
      error(err)
      return { fullfilled: 0, overall: 0, time: 0 }
    }
  }
}
