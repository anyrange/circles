import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@/services/trpc/context";
import { appRouter } from "@/router";
import { env } from "@/config";

const app = new Hono();

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  }),
);

serve({ ...app, port: env.PORT });

console.log("dick = up");
