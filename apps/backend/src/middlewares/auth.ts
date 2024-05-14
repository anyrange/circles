import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";
import { env } from "@/config";

export const authMiddleware = createMiddleware((c, next) => {
  const jwtMiddleware = jwt({
    secret: env.JWT_SECRET,
  });

  return jwtMiddleware(c, next);
});
