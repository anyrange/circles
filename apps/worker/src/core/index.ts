import { controllers } from "@circles/database"
import {
  getTimeDiffSeconds,
  isPromiseFulfilled,
  isPromiseRejected,
} from "../utils"

import type { TaskOptions } from "../types"

export function createTask<T>({
  executeForEachUser,
  handleExecutionResults,
  onFinished,
}: TaskOptions<T>) {
  return async () => {
    try {
      const users = await controllers.task.getInfoForTask()

      const start = new Date()

      const results = await Promise.allSettled(
        users.map((user) => executeForEachUser(user))
      )

      if (handleExecutionResults)
        await handleExecutionResults(
          results.filter(isPromiseFulfilled).map(({ value }) => value)
        )

      if (onFinished) await onFinished()

      const end = new Date()

      const failedTasks = results.filter(isPromiseRejected)

      failedTasks.forEach(({ reason }) => console.error(reason))

      const fullfilled = results.length - failedTasks.length
      const time = getTimeDiffSeconds(start, end)

      return { fullfilled, overall: results.length, time }
    } catch (err) {
      console.error(err)
      return { fullfilled: 0, overall: 0, time: 0 }
    }
  }
}
