import { z } from "zod"
import { fetchMe, fetchTokens } from "@circles/spotify-api"
import { controllers } from "@circles/database"
// import { collectUserHistory } from "@circles/worker"
import { publicProcedure } from "~~/server/trpc"
import { getRedirectURI } from "~~/helpers"

export default publicProcedure
  .input(
    z.object({
      code: z.string(),
    })
  )
  .query(async ({ input }) => {
    const { access_token, refresh_token } = await fetchTokens({
      code: input.code,
      redirectURI: getRedirectURI(),
    })

    const me = await fetchMe(access_token)

    const user = await controllers.user.upsert({
      ...me,
      access_token,
      refresh_token,
    })

    const isNewUser =
      user.last_login.getTime() === user.registration_date.getTime()

    // if (isNewUser)
    //   await parseUserHistory(user.id, access_token, user.display_name)

    return user
  })

// async function parseUserHistory(
//   id: string,
//   access_token: string,
//   display_name: string
// ) {
//   try {
//     const taskOptions = {
//       id,
//       access_token,
//       refresh_token: "",
//     }

//     // await collectUserHistory(taskOptions, 10)
//     // await finishHistoryParsing(access_token)
//   } catch (e) {
//     console.error(`Couldn't parse ${display_name}: ${e}`)
//   }
// }
