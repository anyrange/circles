import { z } from "zod"
import spotifyAPI from "@circles/spotifyAPI"
import { controllers } from "@circles/database"
import { functions } from "@circles/worker"
import { publicProcedure } from "~~/server/trpc/trpc"
import { getRedirectURI } from "~~/utils/utils"

export default publicProcedure
  .input(
    z.object({
      code: z.string(),
    })
  )
  .query(async ({ input }) => {
    const { access_token, refresh_token } = await spotifyAPI.fetchTokens({
      code: input.code,
      redirectURI: getRedirectURI(),
    })

    const me = await spotifyAPI.me(access_token)

    const user = await controllers.user.upsert({
      ...me,
      access_token,
      refresh_token,
    })

    const isNewUser = user.last_login === user.registration_date
    if (isNewUser) {
      await functions.updateUserHistory(
        {
          id: user.id,
          access_token,
          refresh_token,
        },
        50
      )
    }

    return user
  })
