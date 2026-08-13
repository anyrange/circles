import { useInfiniteQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";

import { api } from "@/lib/api";

interface HistoryQuery {
  limit: string;
  before?: string;
}

function initialCursor(): string | undefined {
  return undefined;
}

export function useHistoryQuery() {
  return useInfiniteQuery({
    queryKey: ["me", "history"],
    initialPageParam: initialCursor(),
    queryFn: ({ pageParam }) => {
      const query: HistoryQuery = { limit: "50" };
      if (pageParam) query.before = pageParam;
      return parseResponse(api.me.history.$get({ query }));
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
