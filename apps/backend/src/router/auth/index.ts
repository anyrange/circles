import { Hono } from "hono";
import { spotify } from "./spotify";

const auth = new Hono();

auth.route("/spotify", spotify);

export { auth };
