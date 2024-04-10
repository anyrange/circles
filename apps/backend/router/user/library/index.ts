import { router } from "@/services/trpc";
import { artists } from "./artists";
import { albums } from "./albums";
import { tracks } from "./tracks";

export const library = router({ artists, tracks, albums });
