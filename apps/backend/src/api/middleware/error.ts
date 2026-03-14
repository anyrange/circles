import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";

import { config } from "../../config";
import { logger } from "../../library/logger";

export const errorHandler: ErrorHandler = (err, ctx) => {
  const status = err instanceof HTTPException ? err.status : 500;

  logger.api.error(err);

  return ctx.json(
    {
      status,
      message: err.message,
      ...(config.isDevelopment && { stack: err.stack }),
    },
    status,
  );
};
