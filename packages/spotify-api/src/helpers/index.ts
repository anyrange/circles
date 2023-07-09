import { splitArrayOnChunks } from "@circles/utils"
import { API_DEFAULT_CAPACITY } from "../config"

export async function makeBatchedRequest<
  F extends (ids: string[]) => ReturnType<F>,
>(fn: F, ids: string[], chunkSize = API_DEFAULT_CAPACITY) {
  if (!ids.length) return []

  const results = await Promise.all(
    splitArrayOnChunks(ids, chunkSize).map((chunk) => fn(chunk))
  )

  return results.flat(1)
}
