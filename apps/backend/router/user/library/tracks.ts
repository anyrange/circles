import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { controllers } from "@/services/database";
import { publicProcedure } from "@/services/trpc";

export const tracks = publicProcedure
  .input(
    z.object({
      id: z.string().length(25),
      limit: z.number().gt(0).lte(100).default(10),
      page: z.number().gt(0).default(1),
      start: z.date().optional(),
      end: z.date().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { id, ...options } = input;

    const isPublic = await controllers.user.isPublic(id);

    if (isPublic === null) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    if (!isPublic && id != ctx.user?.id) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const tracks = await controllers.user.topTracks(id, options);
    const isEnd = tracks.length === 0;

    return {
      tracks,
      isEnd,
    };
  });
