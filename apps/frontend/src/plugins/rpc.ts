import { hc } from "hono/client";
import type { AppType } from "@circles/backend";

export const client = hc<AppType>("http://localhost:8000/");
