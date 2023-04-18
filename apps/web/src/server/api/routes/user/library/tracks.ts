import { z } from "zod"
import { controllers } from "@circles/database"
import { publicProcedure } from "~~/server/trpc"

export const tracks = publicProcedure
  .input(
    z.object({
      id: z.string().length(25),
      limit: z.number().gt(0).lte(100).default(10),
      page: z.number().gt(0).default(1),
      start: z.date().optional(),
      end: z.date().optional(),
    })
  )
  .query(async ({ input }) => {
    const { id, limit, page, start, end } = input

    const tracks = await controllers.user.getTracks(id, limit, page, start, end)
    const isEnd = tracks.length === 0

    return {
      tracks,
      isEnd,
    }
  })
