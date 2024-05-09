import { Hono } from "hono";
import { history } from "./history";
import { library } from "./library";
import { followers } from "./followers";
import { follows } from "./follows";
import { info } from "./info";

const user = new Hono()
  .route("/history", history)
  .route("/library", library)
  .route("/followers", followers)
  .route("/follows", follows)
  .route("/info", info);

export { user };
