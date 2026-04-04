import { describe, expect, test, vi } from "vite-plus/test";

// withRetry imports logger, so mock it before importing
vi.mock("./logger", () => ({
  logger: { worker: { warn: vi.fn() } },
}));

// Use fake timers to skip the real 30s+ delay
vi.useFakeTimers();

const { withRetry } = await import("./retry");

describe("withRetry", () => {
  test("returns result immediately on success", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const result = await withRetry(fn);
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("rethrows non-rate-limit errors immediately", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("server error"));
    await expect(withRetry(fn)).rejects.toThrow("server error");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("retries on rate limit errors and eventually succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("rate limit exceeded"))
      .mockRejectedValueOnce(new Error("rate limit exceeded"))
      .mockResolvedValue("done");

    const resultPromise = withRetry(fn, 5);
    // Advance timers past the retry delays
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result).toBe("done");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test("throws after exhausting all retries on rate limit", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("rate limit"))
      .mockRejectedValueOnce(new Error("rate limit"))
      .mockRejectedValueOnce(new Error("rate limit"));
    const resultPromise = withRetry(fn, 3);
    const assertion = expect(resultPromise).rejects.toThrow("rate limit");
    await vi.runAllTimersAsync();
    await assertion;
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
