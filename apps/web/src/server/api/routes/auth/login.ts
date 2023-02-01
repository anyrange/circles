import fetch from "node-fetch"
import { z } from "zod"
import { publicProcedure } from "~~/server/trpc/trpc"
import call from "~~/server/core/queries"
import { getRedirectURI } from "~~/utils/utils"
import { controllers } from "@circles/database"
import { Tokens, TokensError } from "@circles/types"

export default publicProcedure
  .input(
    z.object({
      code: z.string(),
    })
  )
  .query(async ({ input }) => {
    const { accessToken, refreshToken } = await fetchTokens(input.code)

    const me = await call.me(accessToken)

    const user = await controllers.upsertUser({
      id: me.id,
      username: me.display_name,
      avatar: me.images[0].url,
      country: me.country,
      email: me.email,
      accessToken,
      refreshToken,
    })

    return user
  })

async function fetchTokens(code: string) {
  const params = new URLSearchParams()
  params.append("code", code)
  params.append("redirect_uri", `${getRedirectURI()}`)
  params.append("grant_type", "authorization_code")

  const runtimeConfig = useRuntimeConfig()
  const authToken = `${runtimeConfig.public.spotifyClientId}:${runtimeConfig.spotifyClientSecret}`

  const data = (await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: params,
    headers: {
      Authorization: `Basic ${Buffer.from(authToken).toString("base64")}`,
    },
  }).then((res) => res.json())) as Tokens | TokensError

  if (isError(data)) throw new Error(data.error_description)

  const { access_token: accessToken, refresh_token: refreshToken } = data
  return { accessToken, refreshToken }
}

function isError(data: Tokens | TokensError): data is TokensError {
  return (data as TokensError).error !== undefined
}
