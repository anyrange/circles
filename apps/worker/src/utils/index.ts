export function log(text: string) {
  const time = new Date()
  const timestamp = time.toISOString().split(".")[0]

  console.log(`[${timestamp}] ${text}`)
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
