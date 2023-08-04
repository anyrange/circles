import { inferAsyncReturnType } from "@trpc/server"
import { verify } from "~/server/services/jwt"
import type { H3Event } from "h3"

type UserCtx = { id: string }

type Session = {
  id: string
  createdAt: string
  authToken: string | undefined
}

export async function createContext(event: H3Event) {
  async function getUser() {
    const session = event.context.session as Session
    if (!session.authToken) return null

    return await verify<UserCtx>(session.authToken)
  }

  const user = await getUser().catch((e) => null)

  return { user }
}

export type Context = inferAsyncReturnType<typeof createContext>
