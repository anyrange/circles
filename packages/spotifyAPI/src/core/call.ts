import fetch, { RequestInit, Response } from "node-fetch"
import { BASE_ROUTE } from "../config"

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

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
  let options = { method }
  if (method !== "GET") options = Object.assign(options, { body })

  if (token)
    options = Object.assign(options, {
      headers: { Authorization: `Bearer ${token}` },
    })

  const callApi = async (): Promise<Response> => {
    let res = await fetch(`${BASE_ROUTE}${route}`, options)

    if (res.status !== 429) return res

    await sleep(3000)

    return await callApi()
  }

  const res = await callApi()

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

export default call
