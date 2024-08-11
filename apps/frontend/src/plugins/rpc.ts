import { hc } from "hono/client";
import type { AppType } from "../../../backend";

export const client = hc<AppType>("http://localhost:8000/");
