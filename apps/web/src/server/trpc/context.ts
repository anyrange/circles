import { inferAsyncReturnType } from "@trpc/server"
import { fromEntries } from "@circles/utils"
import type { H3Event } from "h3"
import { verify } from "~~/server/services/jwt"

type UserCtx = { id: string }

const parseCookies = (cookies: string) => {
  return cookies.split(";").reduce((acc, cookie) => {
    const kv = cookie.split("=")

    if (kv.length != 2) return acc

    return Object.assign(fromEntries([[kv[0].trimStart(), kv[1]]]), acc)
  }, {}) as { [key: string]: string }
}

export async function createContext(event: H3Event) {
  async function getUser() {
    if (!event.node.req.headers.cookie) return null

    const cookies = parseCookies(event.node.req.headers.cookie)

    if (!cookies.authToken) return null

    return await verify<UserCtx>(cookies.authToken)
  }

  const user = await getUser().catch(() => null)

  return { user }
}

export type Context = inferAsyncReturnType<typeof createContext>
