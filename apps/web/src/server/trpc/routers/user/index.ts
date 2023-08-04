import { history } from "./history"
import { library } from "./library"
import { router } from "~~/server/trpc"

export const user = router({ history, library })
