import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";

import { api } from "@/lib/api";

export type Range = "7d" | "30d" | "90d" | "365d" | "all";

export function useStats(range: Range = "all") {
  return useQuery({
    queryKey: ["me", "stats", range],
    queryFn: () => parseResponse(api.me.stats.$get({ query: { range } })),
  });
}

export function useExtendedStats(range: Range = "all") {
  return useQuery({
    queryKey: ["me", "stats", "extended", range],
    queryFn: () => parseResponse(api.me["stats"]["extended"].$get({ query: { range } })),
  });
}
