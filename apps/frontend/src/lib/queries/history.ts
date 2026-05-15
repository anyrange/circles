import { useInfiniteQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";

import { api } from "@/lib/api";

export function useHistoryQuery() {
  return useInfiniteQuery({
    queryKey: ["me", "history"],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      parseResponse(
        api.me.history.$get({
          query: {
            limit: "50",
            ...(pageParam ? { before: pageParam } : {}),
          },
        }),
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
