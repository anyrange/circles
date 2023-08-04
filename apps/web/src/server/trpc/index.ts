import { initTRPC, TRPCError } from "@trpc/server"
import type { Context } from "./context"

const t = initTRPC.context<Context>().create()

const authMiddleware = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }

  return next({ ctx })
})

export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(authMiddleware)

export const router = t.router

export const middleware = t.middleware
