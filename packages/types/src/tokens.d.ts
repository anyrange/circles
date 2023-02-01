export interface Tokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  scope: string
}

export interface TokensError {
  error: string
  error_description: string
}
