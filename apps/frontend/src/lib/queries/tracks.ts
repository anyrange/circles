import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";

import { api } from "@/lib/api";

export function useTrackQuery(trackId: string) {
  return useQuery({
    queryKey: ["tracks", trackId],
    queryFn: () => parseResponse(api.tracks[":id"].$get({ param: { id: trackId } })),
  });
}
