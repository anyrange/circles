import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
// import { swaggerUI } from "@hono/swagger-ui";

import {
  authMiddleware,
  errorHandler,
  serializeMiddleware,
} from "./middlewares";
import { auth, user } from "./router";
import { env } from "./config";

const app = new Hono();

app.use("/*", cors());
app.use(serializeMiddleware);
app.use(authMiddleware);
app.onError(errorHandler);
app.notFound((c) => c.json("Unknown route", 404));

const routes = app.route("/auth", auth).route("/user", user);
// app.get("/ui", swaggerUI({ url: "/doc" }));

serve(
  {
    port: env.PORT,
    fetch: app.fetch,
  },
  (info) => {
    console.log(`Server is running on http://${info.address}:${info.port}`);
  },
);

export type AppType = typeof routes;
