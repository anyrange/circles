import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";

import { config } from "../config";
import {
  auth,
  ensureFrontendOAuthClient,
  oauthAuthorizationServerMetadata,
  oauthOpenIdConfiguration,
} from "../library/auth";
import { logger } from "../library/logger";
import { createDocsController } from "./controllers/docs";
import { importController } from "./controllers/import";
import { leaderboardController } from "./controllers/leaderboard";
import { libraryController } from "./controllers/library";
import { meController } from "./controllers/me";
import { playlistsController } from "./controllers/playlists";
import { socialController } from "./controllers/social";
import { usersController } from "./controllers/users";
import { errorHandler } from "./middleware/error";
import { type ApiEnv, requestLogger } from "./middleware/request-logger";

const app = new Hono<ApiEnv>()
  .use(requestId())
  .use(requestLogger)
  .use(
    "*",
    cors({
      origin: config.frontend.url,
      credentials: true,
    }),
  )
  .get("/health", (ctx) => ctx.json({ status: "ok" }))
  .get("/.well-known/oauth-authorization-server", (ctx) =>
    oauthAuthorizationServerMetadata(ctx.req.raw),
  )
  .get("/.well-known/openid-configuration", (ctx) => oauthOpenIdConfiguration(ctx.req.raw))
  .route("/docs", createDocsController())
  .on(["GET", "POST"], "/api/auth/*", async (ctx) => auth.handler(ctx.req.raw))
  .route("/me", meController)
  .route("/users", usersController)
  .route("/", socialController)
  .route("/", playlistsController)
  .route("/", libraryController)
  .route("/", importController)
  .route("/", leaderboardController);

app.onError(errorHandler);

export type AppType = typeof app;

const run = async () => {
  await ensureFrontendOAuthClient();
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

void run();
