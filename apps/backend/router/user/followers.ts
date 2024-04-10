import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { controllers } from "@/services/database";
import { publicProcedure } from "@/services/trpc";

export const followers = publicProcedure
  .input(
    z.object({
      id: z.string().length(25),
    }),
  )
  .query(async ({ input }) => {
    const { id } = input;

    const followers = await controllers.user.getFollowers(id);

    if (followers === null) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return {
      followers,
    };
  });
