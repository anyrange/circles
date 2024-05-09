import { hc } from "hono/client";
import { AppType } from "../../backend/src";

const client = hc<AppType>("http://localhost:8787/");

client.user.info.$get({ query: { id: "7uq098pzvp4db2e2138tmgneb" } });
