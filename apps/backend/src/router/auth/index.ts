import { Hono } from "hono";
import { spotify } from "./spotify";

const auth = new Hono().route("/spotify", spotify);

export { auth };
