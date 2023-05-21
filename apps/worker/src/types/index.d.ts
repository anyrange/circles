import { HistoryRecord } from "@circles/types"

export interface UserInfo {
  id: string
  refresh_token: string
  access_token: string
  lastHistoryRecord?: HistoryRecord
}

export interface TaskFn {
  (user: UserInfo[]): Promise<{
    fulfilled: number
    failedTasks: PromiseRejectedResult[]
  }>
}

export interface EntitiesIds {
  userId: string
  trackIds: string[]
  albumIds: string[]
  artistIds: string[]
}

export interface StorageItem {
  trackIds: EntitiesIds["trackIds"]
  albumIds: EntitiesIds["albumIds"]
  artistIds: EntitiesIds["artistIds"]
  history: HistoryRecord[]
  token: string
}
