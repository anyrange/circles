import fetch, { RequestInit, Response } from "node-fetch"
import { sleep } from "@circles/utils"
import { BASE_ROUTE, DEFAULT_RETRY_AFTER, MAXIMUM_RETRY_COUNT } from "../config"

interface APIOptions {
  route: string
  token?: string
  body?: RequestInit["body"]
  method?: "GET" | "POST" | "PUT" | "DELETE"
}

interface APIError {
  error: {
    status: number
    message: string
  }
}

const isAPIError = (data: unknown | APIError): data is APIError =>
  (data as APIError).error !== undefined

export async function call<T>({
  route,
  token,
  body,
  method = "GET",
}: APIOptions) {
  const isGET = method === "GET"

  const options = {
    method,
    ...(!isGET && { body }),
    ...(token && { headers: { Authorization: `Bearer ${token}` } }),
  }

  let retryCount = 0

  const fetchSpotify = async (): Promise<Response> => {
    const res = await fetch(`${BASE_ROUTE}${route}`, options)

    if (res.status !== 429) return res

    if (retryCount >= MAXIMUM_RETRY_COUNT) return res

    retryCount += 1

    const retryAfter =
      Number(res.headers.get("Retry-After")) || DEFAULT_RETRY_AFTER

    await sleep(retryAfter)

    return await fetchSpotify()
  }

  const res = await fetchSpotify()

  const errMsg = `API: ${res.statusText} ${res.status} (${route});`

  if (res.status === 204) throw new Error(errMsg)

  const json = (await res.json().catch(() => {
    throw new Error(errMsg)
  })) as T | APIError

  if (isAPIError(json)) throw new Error(`${errMsg} ${json.error.message}`)

  return json
}
