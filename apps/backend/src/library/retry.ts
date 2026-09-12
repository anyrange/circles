import { logger } from "./logger";

export async function withRetry<T>(fn: () => Promise<T>, retries = 5): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRateLimit = err instanceof Error && err.message.toLowerCase().includes("rate limit");
      if (!isRateLimit || attempt === retries - 1) {
        throw err;
      }
      const delay = 30_000 + Math.random() * 10_000;
      logger.worker.warn({ attempt, delay: Math.round(delay) }, "spotify rate limited, waiting");
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("unreachable");
}
