import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";

import { api } from "@/lib/api";

export function useArtistQuery(artistId: string) {
  return useQuery({
    queryKey: ["artists", artistId],
    queryFn: () => parseResponse(api.artists[":id"].$get({ param: { id: artistId } })),
    refetchInterval: (query) => (query.state.data?.isHydrating ? 2000 : false),
  });
}
