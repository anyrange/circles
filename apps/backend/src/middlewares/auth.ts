import { createMiddleware } from "hono/factory";
import { decode } from "hono/jwt";

export const authMiddleware = createMiddleware((c, next) => {
  const authHeader = c.req.header("Authorization");

  const headerParts = authHeader ? authHeader.split(" ") : [];

  const token = headerParts.length === 2 ? headerParts[1] : null;

  if (!token) {
    return next();
  }

  const { payload } = decode(token);

  c.set("jwtPayload", payload);

  return next();
});
