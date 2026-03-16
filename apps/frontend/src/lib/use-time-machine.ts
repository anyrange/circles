import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useTimeMachine(month: number | null, day: number | null) {
  return useQuery({
    queryKey: ["me", "time-machine", month, day],
    queryFn: async () => {
      const res = await api.me["time-machine"].$get({
        query: { month: String(month), day: String(day) },
      });
      if (!res.ok) throw new Error("Failed to fetch time machine");
      return res.json();
    },
    enabled: month !== null && day !== null,
  });
}
