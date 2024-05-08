import { Hono } from "hono";
import { serializeMiddleware } from "@/middlewares";
import { auth } from "./auth";
import { user } from "./user";

export const routes = (app: Hono) => {
  app.use(serializeMiddleware);

  app.route("/auth", auth);
  app.route("/user", user);
};
