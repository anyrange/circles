import { createNuxtApiHandler } from "trpc-nuxt"
import { router } from "../../trpc/trpc"
import api from "./router"

export const appRouter = router(api)

export type AppRouter = typeof appRouter

export default createNuxtApiHandler({
  router: appRouter,
  createContext: () => ({}),
})
