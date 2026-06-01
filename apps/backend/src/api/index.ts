import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";

import { config } from "../config";
import { auth } from "../library/auth";
import { logger } from "../library/logger";
import { aiController } from "./controllers/ai";
import { createDocsController } from "./controllers/docs";
import { e2eController } from "./controllers/e2e";
import { importController } from "./controllers/import";
import { leaderboardController } from "./controllers/leaderboard";
import { libraryController } from "./controllers/library";
import { meController } from "./controllers/me";
import { playlistsController } from "./controllers/playlists";
import { socialController } from "./controllers/social";
import { usersController } from "./controllers/users";
import { errorHandler } from "./middleware/error";

const app = new Hono()
  .use(requestId())
  .use(
    "*",
    cors({
      origin: config.frontend.url,
      credentials: true,
    }),
  )
  .get("/health", (ctx) => ctx.json({ status: "ok" }))
  .route("/docs", createDocsController())
  .route("/", e2eController)
  .on(["GET", "POST"], "/api/auth/*", async (ctx) => {
    const response = await auth.handler(ctx.req.raw);

    if (ctx.req.path.startsWith("/api/auth/callback/")) {
      const location = response.headers.get("location");
      const setCookie = response.headers.get("set-cookie");
      const sessionToken = setCookie?.match(
        /(?:^|, )__Secure-better-auth\.session_token=([^;]+)/,
      )?.[1];

      if (location && sessionToken) {
        const redirectUrl = new URL(location);
        redirectUrl.searchParams.set("session_token", decodeURIComponent(sessionToken));
        const headers = new Headers(response.headers);
        headers.set("location", redirectUrl.toString());
        return new Response(response.body, { headers, status: response.status });
      }
    }

    return response;
  })
  .route("/me", meController)
  .route("/users", usersController)
  .route("/", socialController)
  .route("/", playlistsController)
  .route("/", libraryController)
  .route("/", aiController)
  .route("/", importController)
  .route("/", leaderboardController);

app.onError(errorHandler);

export type AppType = typeof app;

const run = () => {
  logger.api.info(`starting server on http://${config.http.host}:${config.http.port}`);

  const server = serve({
    hostname: config.http.host,
    port: config.http.port,
    fetch: app.fetch,
  });

  process.on("SIGINT", () => {
    server.close();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    server.close((err) => {
      if (err) {
        logger.api.error(err);
        process.exit(1);
      }
      process.exit(0);
    });
  });
};

run();
