import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { controllers } from "@/services/database";
import { publicProcedure } from "@/services/trpc";

export const follows = publicProcedure
  .input(
    z.object({
      id: z.string().length(25),
    }),
  )
  .query(async ({ input }) => {
    const { id } = input;

    const follows = await controllers.user.getFollows(id);

    if (follows === null) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return {
      follows,
    };
  });
