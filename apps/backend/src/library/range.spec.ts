import { expect, test, vi } from "vite-plus/test";

import { sinceFromRange } from "./range";

test("returns undefined for 'all'", () => {
  expect(sinceFromRange("all")).toBeUndefined();
});

test.each([
  ["7d", 7],
  ["30d", 30],
  ["90d", 90],
  ["365d", 365],
] as const)("returns a date %s days ago for range '%s'", (range, days) => {
  const now = new Date("2026-04-04T12:00:00Z");
  vi.setSystemTime(now);

  const result = sinceFromRange(range);
  expect(result).toBeInstanceOf(Date);

  const expected = new Date(now);
  expected.setDate(expected.getDate() - days);
  expect(result?.toDateString()).toBe(expected.toDateString());

  vi.useRealTimers();
});
