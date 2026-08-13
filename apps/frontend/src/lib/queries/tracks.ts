import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";

import { api } from "@/lib/api";
import type { Range } from "@/lib/queries/stats";

export function useTrackQuery(trackId: string, range: Range = "all") {
  return useQuery({
    queryKey: ["tracks", trackId, range],
    queryFn: () =>
      parseResponse(api.tracks[":id"].$get({ param: { id: trackId }, query: { range } })),
  });
}
