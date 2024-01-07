import { HistoryRecord } from "@circles/types"

export interface UserInfo {
  id: string
  refresh_token: string
  access_token: string
  lastHistoryRecord?: HistoryRecord
}

export interface EntitiesIds {
  userId: string
  trackIds: string[]
  albumIds: string[]
  artistIds: string[]
}
