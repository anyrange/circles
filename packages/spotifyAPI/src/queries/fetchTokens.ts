import fetch from "node-fetch"
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "../config"

import type { Tokens, TokensError } from "@circles/types"

interface CodeOptions {
  code: string
  redirectURI: string
}

interface RefreshTokenOptions {
  refresh_token: Tokens["refresh_token"]
}

export async function fetchTokens(options: CodeOptions | RefreshTokenOptions) {
  const params = createParams(options)

  new URLSearchParams()

  const authToken = `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`

  const data = (await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: params,
    headers: {
      Authorization: `Basic ${Buffer.from(authToken).toString("base64")}`,
    },
  }).then((res) => res.json())) as Tokens | TokensError

  if (isError(data)) throw new Error(data.error_description)

  return data
}

export default fetchTokens

function createParams(data: CodeOptions | RefreshTokenOptions) {
  const params = new URLSearchParams()

  if (isCodeOptions(data)) {
    params.append("grant_type", "authorization_code")
    params.append("code", data.code)
    params.append("redirect_uri", `${data.redirectURI}`)
  } else {
    params.append("grant_type", "refresh_token")
    params.append("refresh_token", data.refresh_token)
  }

  return params
}

function isError(data: Tokens | TokensError): data is TokensError {
  return (data as TokensError).error !== undefined
}

function isCodeOptions(
  data: CodeOptions | RefreshTokenOptions
): data is CodeOptions {
  return (data as CodeOptions).code !== undefined
}
