import { Hono } from "hono";

import { artists } from "./artists";
import { albums } from "./albums";
import { tracks } from "./tracks";

const library = new Hono()
  .route("/artists", artists)
  .route("/tracks", tracks)
  .route("/albums", albums);

export { library };
