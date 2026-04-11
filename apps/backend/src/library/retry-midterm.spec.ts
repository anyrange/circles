import { describe, expect, test, vi } from "vite-plus/test";

vi.mock("./logger", () => ({
  logger: { worker: { warn: vi.fn() } },
}));

vi.useFakeTimers();

const { withRetry } = await import("./retry");

describe("TC-RETRY-FAIL-01 — withRetry with budget=1 fails immediately on rate limit", () => {
  test("throws on first rate-limit when retry budget is 1", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("rate limit exceeded"));
    const resultPromise = withRetry(fn, 1);
    const assertion = expect(resultPromise).rejects.toThrow("rate limit exceeded");
    await vi.runAllTimersAsync();
    await assertion;
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("TC-RETRY-CONC-01 — concurrent withRetry calls resolve independently", () => {
  test("two simultaneous calls do not interfere with each other", async () => {
    const fn1 = vi
      .fn()
      .mockRejectedValueOnce(new Error("rate limit exceeded"))
      .mockResolvedValue("result-a");

    const fn2 = vi.fn().mockResolvedValue("result-b");

    const p1 = withRetry(fn1, 3);
    const p2 = withRetry(fn2, 3);

    await vi.runAllTimersAsync();

    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toBe("result-a");
    expect(r2).toBe("result-b");
    expect(fn1).toHaveBeenCalledTimes(2);
    expect(fn2).toHaveBeenCalledTimes(1);
  });
});

describe("TC-RETRY-INVAL-01 — withRetry propagates non-Error rejection values", () => {
  test("rethrows string rejection without treating it as a rate-limit error", async () => {
    const fn = vi.fn().mockRejectedValue("plain string error");
    await expect(withRetry(fn, 3)).rejects.toBe("plain string error");
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
