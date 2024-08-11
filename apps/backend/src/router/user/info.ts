import { z } from "zod";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { controllers } from "../../services/database";
import { createSuccessResponse } from "../../middlewares/serialize";

const info = new Hono().get(
  "/",
  zValidator(
    "query",
    z.object({
      id: z.string().length(25),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid("query");
    const payload = c.get("jwtPayload");

    const isPublic = await controllers.user.isPublic(id);

    if (isPublic === null) {
      throw new HTTPException(404, { message: "NOT_FOUND" });
    }

    if (!isPublic && id != payload.user?.id) {
      throw new HTTPException(403, { message: "FORBIDDEN" });
    }

    const user = await controllers.user.getOne(id);

    if (!user) {
      throw new HTTPException(404, { message: "NOT_FOUND" });
    }

    return c.json(createSuccessResponse(user), 200);
  },
);

export { info };
