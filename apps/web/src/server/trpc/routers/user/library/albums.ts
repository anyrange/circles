import { z } from "zod"
import { TRPCError } from "@trpc/server"
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
  .query(async ({ input, ctx }) => {
    const { id, ...options } = input

    const isPublic = await controllers.user.isPublic(id)

    if (isPublic === null) throw new TRPCError({ code: "NOT_FOUND" })

    if (!isPublic && id != ctx.user?.id)
      throw new TRPCError({ code: "FORBIDDEN" })

    const albums = await controllers.user.topAlbums(id, options)
    const isEnd = 0

    return {
      albums,
      isEnd,
    }
  })
