import { router } from "@/services/trpc";
import { history } from "./history";
import { library } from "./library";
import { followers } from "./followers";
import { follows } from "./follows";
import { info } from "./info";

export const user = router({ history, library, followers, follows, info });
