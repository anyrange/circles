import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export type Range = "7d" | "30d" | "90d" | "365d" | "all";

export function useStats(range: Range = "all") {
  return useQuery({
    queryKey: ["me", "stats", range],
    queryFn: async () => {
      const res = await api.me.stats.$get({ query: { range } });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });
}

export function useExtendedStats(range: Range = "all") {
  return useQuery({
    queryKey: ["me", "stats", "extended", range],
    queryFn: async () => {
      const res = await api.me["stats"]["extended"].$get({ query: { range } });
      if (!res.ok) throw new Error("Failed to fetch extended stats");
      return res.json();
    },
  });
}
