import { z } from "zod";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { controllers } from "@/services/database";

const followers = new Hono().get(
  "/",
  zValidator(
    "query",
    z.object({
      id: z.string().length(25),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid("query");

    const followers = await controllers.user.getFollowers(id);

    if (followers === null) {
      throw new HTTPException(404, { message: "NOT_FOUND" });
    }

    return c.json({ followers }, 200);
  },
);

export { followers };
