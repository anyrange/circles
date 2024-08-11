import { createMiddleware } from "hono/factory";

type Response<T> = [T, null] | [null, any];

export const createSuccessResponse = <T>(data: T) =>
  [data, null] as Response<T>;

export const createErrorResponse = <T>(error: T) =>
  [null, error] as Response<null>;

export const serializeMiddleware = createMiddleware(async (c, next) => {
  await next();

  const response = c.res;

  if (response.ok) {
    return;
  }

  const body = (await c.res.json()) as any;

  const isZodError = body?.error?.name === "ZodError";

  c.res = new Response(
    JSON.stringify(createErrorResponse(isZodError ? body.error : body)),
    { status: c.res.status },
  );
});
