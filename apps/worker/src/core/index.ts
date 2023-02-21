import { controllers } from "@circles/database"
import { getTimeDiffSeconds } from "../utils"

import type { TaskFn } from "../types"

const isRejected = (
  input: PromiseSettledResult<unknown>
): input is PromiseRejectedResult => input.status === "rejected"

export function createTask<T>(fn: TaskFn<T>) {
  return async () => {
    try {
      const users = await controllers.user.getAllTokens()

      const start = new Date()
      const results = await Promise.allSettled(users.map((user) => fn(user)))
      const end = new Date()

      const failedTasks = results.filter(isRejected)

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
