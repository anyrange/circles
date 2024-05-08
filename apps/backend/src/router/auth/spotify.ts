import { z } from "zod";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { zValidator } from "@hono/zod-validator";
import { controllers } from "@/services/database";
import { spotifyAPI } from "@/services/spotify-api";
import { getRedirectURI } from "@/helpers";
import { env } from "@/config";

const spotify = new Hono();

spotify.get(
  "/",
  zValidator(
    "query",
    z.object({
      code: z.string(),
    }),
  ),
  async (c) => {
    const { code } = c.req.valid("query");

    const { access_token, refresh_token } = await spotifyAPI.fetchTokens({
      code,
      redirectURI: getRedirectURI(),
    });

    const me = await spotifyAPI.fetchMe(access_token);

    const user = await controllers.user.upsert({
      ...me,
      access_token,
      refresh_token,
    });

    const authToken = await sign({ id: user.id }, env.JWT_SECRET);

    return c.json({ user, authToken }, 200);
  },
);

export { spotify };
