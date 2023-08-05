import { z } from "zod"
import { TRPCError } from "@trpc/server"
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
  .query(async ({ input, ctx }) => {
    const { id, ...options } = input

    const isPublic = await controllers.user.isPublic(id)

    if (isPublic === null) throw new TRPCError({ code: "NOT_FOUND" })

    if (!isPublic && id != ctx.user?.id)
      throw new TRPCError({ code: "FORBIDDEN" })

    const history = await controllers.user.getHistory(id, options)
    const isEnd = !history.length

    return {
      history,
      cursor: !isEnd ? history[history.length - 1].id : -1,
      isEnd,
    }
  })
