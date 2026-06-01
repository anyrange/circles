import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";

import { api } from "@/lib/api";

export function useTimeMachine(month: number | null, day: number | null) {
  return useQuery({
    queryKey: ["me", "time-machine", month, day],
    queryFn: () =>
      parseResponse(
        api.me["time-machine"].$get({
          query: { month: String(month), day: String(day) },
        }),
      ),
    enabled: month !== null && day !== null,
  });
}
