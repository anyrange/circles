import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { routes } from "./router";
import { createErrorResponse } from "./middlewares/serialize";

const app = new Hono();

routes(app);

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json(err.message, err.status);
  }

  console.error(err);

  return c.json("Internal error", 500);
});

app.notFound((c) => c.json("Unknown route", 404));

export default app;
