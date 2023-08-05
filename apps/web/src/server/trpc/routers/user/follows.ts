import { z } from "zod"
import { controllers } from "~~/server/services/database"
import { publicProcedure } from "~~/server/trpc"
import { TRPCError } from "@trpc/server"

export const follows = publicProcedure
  .input(
    z.object({
      id: z.string().length(25),
    })
  )
  .query(async ({ input }) => {
    const { id } = input

    const follows = await controllers.user.getFollows(id)

    if (follows === null) throw new TRPCError({ code: "NOT_FOUND" })

    return {
      follows,
    }
  })
