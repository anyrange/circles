import { artists } from "./artists"
import { albums } from "./albums"
import { tracks } from "./tracks"
import { router } from "~~/server/trpc"

export const library = router({ artists, tracks, albums })
