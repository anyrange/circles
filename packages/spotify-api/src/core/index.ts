import fetch, { RequestInit, Response } from "node-fetch"
import { BASE_ROUTE, DEFAULT_RETRY_AFTER } from "../config"
import { sleep } from "../utils"

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

export async function call<T>({
  route,
  token,
  body,
  method = "GET",
}: APIOptions) {
  const options = {
    method,
    ...(method !== "GET" && { body }),
    ...(token && { headers: { Authorization: `Bearer ${token}` } }),
  }

  const fetchSpotify = async (): Promise<Response> => {
    const res = await fetch(`${BASE_ROUTE}${route}`, options)

    if (res.status !== 429) return res

    const retryAfter =
      Number(res.headers.get("Retry-After")) || DEFAULT_RETRY_AFTER
    await sleep(retryAfter)

    return await fetchSpotify()
  }

  const res = await fetchSpotify()

  if (res.status === 204) throw new Error("")

  const json = (await res.json().catch(() => {
    console.error(`API: ${res.statusText} ${res.status}; (${route})`)
    console.error(options)
    throw new Error("Something went wrong")
  })) as T | APIError

  const isError = (data: T | APIError): data is APIError => {
    return (data as APIError).error !== undefined
  }

  if (isError(json)) {
    throw new Error(
      `API: ${res.statusText} ${res.status}; ${json.error.message} (${route})`
    )
  }

  return json
}
