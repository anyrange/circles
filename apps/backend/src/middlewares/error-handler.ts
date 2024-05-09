import { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    return c.json(err.message, err.status);
  }

  console.error(err);

  return c.json("Internal error", 500);
};
