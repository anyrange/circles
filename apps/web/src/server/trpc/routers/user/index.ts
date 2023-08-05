import { history } from "./history"
import { library } from "./library"
import { followers } from "./followers"
import { follows } from "./follows"
import { router } from "~~/server/trpc"

export const user = router({ history, library, followers, follows })
