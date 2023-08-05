import { z } from "zod"
import { controllers } from "~~/server/services/database"
import { publicProcedure } from "~~/server/trpc"
import { TRPCError } from "@trpc/server"

export const followers = publicProcedure
  .input(
    z.object({
      id: z.string().length(25),
    })
  )
  .query(async ({ input }) => {
    const { id } = input

    const followers = await controllers.user.getFollowers(id)

    if (followers === null) throw new TRPCError({ code: "NOT_FOUND" })

    return {
      followers,
    }
  })
