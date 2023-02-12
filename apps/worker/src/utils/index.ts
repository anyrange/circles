export function log(text: string) {
  const time = new Date()
  const timestamp = time.toISOString().split(".")[0]
  console.log(`[${timestamp}] ${text}`)
}

export function timeDiffSec(start: Date, end: Date) {
  const diffInMs = end.getTime() - start.getTime()
  const diffInS = diffInMs / 1000
  return Number(diffInS.toFixed(2))
}
