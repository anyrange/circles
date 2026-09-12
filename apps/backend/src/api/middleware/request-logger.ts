import type { HttpBindings } from "@hono/node-server";
import type { MiddlewareHandler } from "hono";
import type { Logger } from "pino";
import pino from "pino";
import { pinoHttp } from "pino-http";

import { logger } from "../../library/logger";

export type ApiEnv = {
  Bindings: HttpBindings;
  Variables: {
    logger: Logger;
    requestId: string;
  };
};

const httpLogger = pinoHttp({
  logger: logger.api,
  quietReqLogger: true,
  wrapSerializers: false,
  serializers: {
    err: pino.stdSerializers.err,
    req: (request) => ({
      method: request.method,
      path: request.url ? new URL(request.url, "http://localhost").pathname : undefined,
    }),
    res: (response) => ({ statusCode: response.statusCode }),
  },
  customLogLevel: (_request, response, error) => {
    if (error || response.statusCode >= 500) {
      return "error";
    }
    if (response.statusCode >= 400) {
      return "warn";
    }
    return "info";
  },
});

export const requestLogger: MiddlewareHandler<ApiEnv> = async (ctx, next) => {
  ctx.env.incoming.id = ctx.var.requestId;

  await new Promise<void>((resolve) => {
    httpLogger(ctx.env.incoming, ctx.env.outgoing, resolve);
  });

  ctx.set("logger", ctx.env.incoming.log);
  await next();
};
