import { z } from "zod"
import { controllers } from "~~/server/services/database"
import { publicProcedure } from "~~/server/trpc"

export const history = publicProcedure
  .input(
    z.object({
      id: z.string().length(25),
      limit: z.number().gt(0).lte(100).default(10),
      cursor: z.number().default(0),
    })
  )
  .query(async ({ input }) => {
    const { id, limit, cursor } = input

    const history = await controllers.user.getHistory(id, limit, cursor)
    const isEnd = !history.length

    return {
      history,
      cursor: !isEnd ? history[history.length - 1].id : -1,
      isEnd,
    }
  })
