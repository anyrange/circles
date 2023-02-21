export interface TaskOptions {
  id: string
  refresh_token: string
  access_token: string
}

export interface TaskFn<T> {
  (user: TaskOptions): T
}

export interface EntitiesIds {
  trackIds: string[]
  albumIds: string[]
  artistIds: string[]
}
