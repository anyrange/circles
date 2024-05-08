import { Hono } from "hono";

import { artists } from "./artists";
import { albums } from "./albums";
import { tracks } from "./tracks";

const library = new Hono();

library.route("/artists", artists);
library.route("/tracks", tracks);
library.route("/albums", albums);

export { library };
