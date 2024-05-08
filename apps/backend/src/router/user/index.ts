import { Hono } from "hono";
import { history } from "./history";
import { library } from "./library";
import { followers } from "./followers";
import { follows } from "./follows";
import { info } from "./info";

const user = new Hono();

user.route("/history", history);
user.route("/library", library);
user.route("/followers", followers);
user.route("/follows", follows);
user.route("/info", info);

export { user };
