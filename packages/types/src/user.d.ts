export type Privacy = "PUBLIC" | "PRIVATE"

export interface User {
  id: string
  username: string
  avatar: string
  country: string
  email: string
  accessToken: string
  refreshToken: string
  registrationDate?: string
  lastLogin?: string
  privacy?: Privacy
}
