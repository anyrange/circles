import { spotify } from "./spotify"
import { router } from "~~/server/trpc"

export const auth = router({ spotify })
