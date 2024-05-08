import { z } from "zod";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { controllers } from "@/services/database";

const albums = new Hono();

albums.get(
  "/",
  zValidator(
    "query",
    z.object({
      id: z.string().length(25),
      limit: z.number().gt(0).lte(100).default(10),
      page: z.number().gt(0).default(1),
      start: z.date().optional(),
      end: z.date().optional(),
    }),
  ),
  async (c) => {
    const { id, ...options } = c.req.valid("query");
    const payload = c.get("jwtPayload");

    const isPublic = await controllers.user.isPublic(id);

    if (isPublic === null) {
      throw new HTTPException(404, { message: "NOT_FOUND" });
    }

    if (!isPublic && id != payload.user?.id) {
      throw new HTTPException(403, { message: "FORBIDDEN" });
    }

    const albums = await controllers.user.topAlbums(id, options);
    const isEnd = 0;

    return c.json({ albums, isEnd }, 200);
  },
);

export { albums };
