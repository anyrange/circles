import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { controllers } from "@/services/database";
import { publicProcedure } from "@/services/trpc";

export const info = publicProcedure
  .input(
    z.object({
      id: z.string().length(25),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { id } = input;

    const isPublic = await controllers.user.isPublic(id);

    if (isPublic === null) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    if (!isPublic && id != ctx.user?.id) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const user = await controllers.user.getOne(id);

    return {
      user,
    };
  });
