import { router } from "@/services/trpc";
import { spotify } from "./spotify";

export const auth = router({ spotify });
