import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseResponse } from "hono/client";

import { api } from "@/lib/api";

export function usePlaylists() {
  return useQuery({
    queryKey: ["me", "playlists"],
    queryFn: () => parseResponse(api.me.playlists.$get()),
  });
}

export function usePlaylistTracks(id: string) {
  return useQuery({
    queryKey: ["me", "playlists", id, "tracks"],
    queryFn: () => parseResponse(api.me.playlists[":id"].tracks.$get({ param: { id } })),
    enabled: !!id,
  });
}

export function useCreatePlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      parseResponse(api.me.playlists.$post({ json: data })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "playlists"] }),
  });
}

export function useDeletePlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => parseResponse(api.me.playlists[":id"].$delete({ param: { id } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "playlists"] }),
  });
}
