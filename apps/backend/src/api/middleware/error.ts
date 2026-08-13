import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";

import { config } from "../../config";
import type { ApiEnv } from "./request-logger";

export const errorHandler: ErrorHandler<ApiEnv> = (err, ctx) => {
  const status = err instanceof HTTPException ? err.status : 500;

  const log = ctx.var.logger;
  if (status >= 500) {
    log.error({ err, status }, "request failed");
  } else {
    log.warn({ err, status }, "request failed");
  }

  return ctx.json(
    {
      status,
      message: err.message,
      ...(config.isDevelopment && { stack: err.stack }),
    },
    status,
  );
};
