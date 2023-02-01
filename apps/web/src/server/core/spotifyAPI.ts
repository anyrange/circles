import fetch, { RequestInit, Response } from "node-fetch"

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

export async function spotifyAPI<T>({
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
    let res = await fetch(`https://api.spotify.com/v1/${route}`, options)

    if (res.status !== 429) return res

    await sleep(2000)

    return await callApi()
  }

  const res = await callApi()

  if (res.status === 204) throw new Error("")

  const json = (await res.json().catch(() => {
    console.error("API Error:", res.statusText, res.status)
    console.error(`https://api.spotify.com/v1/${route}`)
    console.error(options)
    throw new Error("Something went wrong")
  })) as T | APIError

  const isError = (data: T | APIError): data is APIError => {
    return (data as APIError).error !== undefined
  }

  if (isError(json)) {
    console.error("API Error:", res.statusText, res.status)
    console.error(`https://api.spotify.com/v1/${route}`)
    console.error(json.error)
    throw new Error(json.error.message)
  }

  return json
}

export default spotifyAPI
