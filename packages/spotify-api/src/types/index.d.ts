export interface CodeOptions {
  code: string
  redirectURI: string
}

export interface RefreshTokenOptions {
  refresh_token: Tokens["refresh_token"]
}

export type EntitiesIds = {
  trackIds: string[]
  albumIds: string[]
  artistIds: string[]
}
