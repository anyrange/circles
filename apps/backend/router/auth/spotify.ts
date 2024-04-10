import { z } from "zod";
import { controllers } from "@/services/database";
import { spotifyAPI } from "@/services/spotify-api";
import { sign } from "@/services/jwt";
import { publicProcedure } from "@/services/trpc";
import { getRedirectURI } from "@/helpers";

export const spotify = publicProcedure
  .input(
    z.object({
      code: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { access_token, refresh_token } = await spotifyAPI.fetchTokens({
      code: input.code,
      redirectURI: getRedirectURI(),
    });

    const me = await spotifyAPI.fetchMe(access_token);

    const user = await controllers.user.upsert({
      ...me,
      access_token,
      refresh_token,
    });

    const authToken = await sign({ id: user.id });

    return { user, authToken };
  });
