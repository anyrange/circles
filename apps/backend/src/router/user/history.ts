import { z } from "zod";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { controllers } from "@/services/database";

const history = new Hono().get(
  "/",
  zValidator(
    "query",
    z.object({
      id: z.string().length(25),
      limit: z.number().gt(0).lte(100).default(10),
      cursor: z.number().default(0),
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

    const history = await controllers.user.getHistory(id, options);
    const isEnd = !history.length;

    return c.json(
      {
        history,
        cursor: !isEnd ? history[history.length - 1].id : -1,
        isEnd,
      },
      200,
    );
  },
);

export { history };
