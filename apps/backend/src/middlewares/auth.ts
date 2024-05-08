import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { env } from "@/config";

const authMiddleware = new Hono();

authMiddleware.use("/*", (c, next) => {
  const jwtMiddleware = jwt({
    secret: env.JWT_SECRET,
  });

  return jwtMiddleware(c, next);
});

export { authMiddleware };
