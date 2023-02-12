import { controllers } from "@circles/database"
import { timeDiffSec } from "../utils"

export interface TaskOptions {
  id: string
  refresh_token: string
  access_token: string
}

interface taskFn<T> {
  (user: TaskOptions): T
}

const isRejected = (
  input: PromiseSettledResult<unknown>
): input is PromiseRejectedResult => input.status === "rejected"

export function taskBase<T>(fn: taskFn<T>) {
  return async () => {
    try {
      const users = await controllers.user.getAllTokens()

      const start = new Date()
      const res = await Promise.allSettled(users.map((user) => fn(user)))
      const end = new Date()
      const time = timeDiffSec(start, end)

      const rejectedRes = res.filter(isRejected)
      rejectedRes.forEach(({ reason }) => console.error(reason))

      const fullfilled = res.length - rejectedRes.length
      return { fullfilled, overall: res.length, time }
    } catch (err) {
      console.error(err)
      return { fullfilled: 0, overall: 0, time: 0 }
    }
  }
}
