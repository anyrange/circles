export function getTimeStamp() {
  const time = new Date()
  const timestamp = time.toISOString().split(".")[0]
  return timestamp
}

export function log(text: string) {
  console.log(`[${getTimeStamp()}]`, text)
}

export function error(...errs: unknown[]) {
  console.error(`[${getTimeStamp()}]`, ...errs)
}

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function getTimeDiffSeconds(start: Date, end: Date) {
  const diffMs = end.getTime() - start.getTime()
  const diffSeconds = diffMs / 1000

  return Number(diffSeconds.toFixed(2))
}

export function splitArrayOnChunks<T>(arr: T[], chunkSize: number) {
  return Array(Math.ceil(arr.length / chunkSize))
    .fill(0)
    .map((_, i) => arr.slice(i * chunkSize, i * chunkSize + chunkSize))
}

export function isPromiseRejected(
  input: PromiseSettledResult<unknown>
): input is PromiseRejectedResult {
  return input.status === "rejected"
}

export function isPromiseFulfilled<T>(
  input: PromiseSettledResult<T>
): input is PromiseFulfilledResult<T> {
  return input.status === "fulfilled"
}

export function uniquifyArray<T>(arr: T[]) {
  return [...new Set(arr)]
}
