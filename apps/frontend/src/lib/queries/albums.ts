import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";

import { api } from "@/lib/api";
import type { Range } from "@/lib/queries/stats";

export function useAlbumQuery(albumId: string, range: Range = "all") {
  return useQuery({
    queryKey: ["albums", albumId, range],
    queryFn: () =>
      parseResponse(api.albums[":id"].$get({ param: { id: albumId }, query: { range } })),
  });
}
