import { z } from "zod"
import { controllers } from "~~/server/services/database"
import { publicProcedure } from "~~/server/trpc"

export const albums = publicProcedure
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
    const { id, ...options } = input

    const albums = await controllers.user.topAlbums(id, options)
    const isEnd = 0

    return {
      albums,
      isEnd,
    }
  })
