import { Hono } from "hono";
// import { swaggerUI } from "@hono/swagger-ui";

import {
  authMiddleware,
  errorHandler,
  serializeMiddleware,
} from "@/middlewares";
import { auth, user } from "@/router";
import { env } from "@/config";

const app = new Hono();

app.use(serializeMiddleware);
app.use(authMiddleware);
app.onError(errorHandler);
app.notFound((c) => c.json("Unknown route", 404));

const routes = app.route("/auth", auth).route("/user", user);
// app.get("/ui", swaggerUI({ url: "/doc" }));

export default {
  port: env.PORT,
  fetch: app.fetch,
};

export type AppType = typeof routes;
