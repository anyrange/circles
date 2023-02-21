import { createNuxtApiHandler } from "trpc-nuxt"
import { router } from "../trpc"
import { routes } from "./router"

export const appRouter = router(routes)

export type AppRouter = typeof appRouter

export default createNuxtApiHandler({
  router: appRouter,
  createContext: () => ({}),
})
