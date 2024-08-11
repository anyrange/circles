import { hc } from "hono/client";
import type { AppType } from "../../backend";

const client = hc<AppType>("http://localhost:8787/");

await client.user.info.$get({ query: { id: "7uq098pzvp4db2e2138tmgneb" } });
