import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";

import { openApiDocument } from "../openapi";

export const createDocsController = () =>
  new Hono()
    .get(
      "/",
      Scalar({
        title: "Circles API Docs",
        url: "/docs/openapi.json",
        theme: "kepler",
        layout: "modern",
        defaultHttpClient: {
          targetKey: "js",
          clientKey: "fetch",
        },
      }),
    )
    .get("/openapi.json", (ctx) => ctx.json(openApiDocument));
