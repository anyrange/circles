import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function usePlaylists() {
  return useQuery({
    queryKey: ["me", "playlists"],
    queryFn: async () => {
      const res = await api.me.playlists.$get();
      if (!res.ok) throw new Error("Failed to fetch playlists");
      return res.json();
    },
  });
}

export function usePlaylistTracks(id: string) {
  return useQuery({
    queryKey: ["me", "playlists", id, "tracks"],
    queryFn: async () => {
      const res = await api.me.playlists[":id"].tracks.$get({ param: { id } });
      if (!res.ok) throw new Error("Failed to fetch playlist tracks");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreatePlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await api.me.playlists.$post({ json: data });
      if (!res.ok) throw new Error("Failed to create playlist");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "playlists"] }),
  });
}

export function useDeletePlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.me.playlists[":id"].$delete({ param: { id } });
      if (!res.ok) throw new Error("Failed to delete playlist");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "playlists"] }),
  });
}
