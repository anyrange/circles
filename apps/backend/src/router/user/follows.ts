import { z } from "zod";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { controllers } from "../../services/database";

const follows = new Hono().get(
  "/",
  zValidator(
    "query",
    z.object({
      id: z.string().length(25),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid("query");

    const follows = await controllers.user.getFollows(id);

    if (follows === null) {
      throw new HTTPException(404, { message: "NOT_FOUND" });
    }

    return c.json({ follows }, 200);
  },
);

export { follows };
