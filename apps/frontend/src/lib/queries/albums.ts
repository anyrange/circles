import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";

import { api } from "@/lib/api";

export function useAlbumQuery(albumId: string) {
  return useQuery({
    queryKey: ["albums", albumId],
    queryFn: () => parseResponse(api.albums[":id"].$get({ param: { id: albumId } })),
  });
}
