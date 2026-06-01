import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";

import { api } from "@/lib/api";
import type { Range } from "@/lib/queries/stats";

export function useUserByUsernameQuery(username: string) {
  return useQuery({
    queryKey: ["users", "by-username", username],
    queryFn: () =>
      parseResponse(api.users["by-username"][":username"].$get({ param: { username } })),
  });
}

export function useUserStatsQuery(userId: string | undefined, range: Range = "all") {
  return useQuery({
    queryKey: ["users", userId, "stats", range],
    queryFn: () =>
      parseResponse(
        api.users[":id"].stats.$get({
          param: { id: userId! },
          query: { range },
        }),
      ),
    enabled: !!userId,
  });
}

export function useUserExtendedStatsQuery(userId: string | undefined, range: Range = "all") {
  return useQuery({
    queryKey: ["users", userId, "stats", "extended", range],
    queryFn: () =>
      parseResponse(
        api.users[":id"]["stats"]["extended"].$get({
          param: { id: userId! },
          query: { range },
        }),
      ),
    enabled: !!userId,
  });
}
