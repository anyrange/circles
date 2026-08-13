import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";

import { api } from "@/lib/api";
import type { Range } from "@/lib/queries/stats";

export function useArtistQuery(artistId: string, range: Range = "all") {
  return useQuery({
    queryKey: ["artists", artistId, range],
    queryFn: () =>
      parseResponse(api.artists[":id"].$get({ param: { id: artistId }, query: { range } })),
    refetchInterval: (query) => (query.state.data?.isHydrating ? 2000 : false),
  });
}
