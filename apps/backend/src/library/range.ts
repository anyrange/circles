export type Range = "7d" | "30d" | "90d" | "365d" | "all";

export function sinceFromRange(range: Range): Date | undefined {
  if (range === "all") return undefined;

  const days = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "365d": 365,
  } satisfies Record<Exclude<Range, "all">, number>;

  const d = new Date();
  d.setDate(d.getDate() - days[range]);
  return d;
}
