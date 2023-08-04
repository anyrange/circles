import { router } from ".."
import { auth } from "./auth"
import { user } from "./user"

export const appRouter = router({
  auth,
  user,
})

export type AppRouter = typeof appRouter
