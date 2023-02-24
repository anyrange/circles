import { HistoryRecord } from "@circles/types"

export interface UserOptions {
  id: string
  refresh_token: string
  access_token: string
  lastHistoryRecord: HistoryRecord | undefined
}

export interface PerUserFn<T> {
  (user: UserOptions): Promise<T>
}

export interface EveryUserFn<T> {
  (perUserResults: T[]): void
}

export interface FinalFn {
  (args: void): void
}

export interface TaskOptions<T> {
  executeForEachUser: PerUserFn<T>
  handleExecutionResults?: EveryUserFn<T>
  onFinished?: FinalFn
}

export interface EntitiesIds {
  trackIds: string[]
  albumIds: string[]
  artistIds: string[]
}
