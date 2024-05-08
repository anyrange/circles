import { createMiddleware } from "hono/factory";

export const createSuccessResponse = (data: any) => ({
  success: true,
  data,
});

export const createErrorResponse = (error: any) => ({
  success: false,
  error,
});

export const serializeMiddleware = createMiddleware(async (c, next) => {
  await next();

  const response = c.res;

  const body = (await c.res.json()) as any;

  const isZodError = body?.error?.name === "ZodError";

  c.res = new Response(
    JSON.stringify(
      response.ok
        ? createSuccessResponse(body)
        : createErrorResponse(isZodError ? body.error : body),
    ),
    { status: c.res.status },
  );
});
