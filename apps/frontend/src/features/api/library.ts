import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

type SearchParams = {
  range: "7d" | "30d" | "90d" | "365d" | "all";
  tab: string;
};

export const useLibraryOverview = (search: SearchParams) =>
  useQuery({
    queryKey: ["library", "overview", search.range],
    queryFn: async () => {
      const res = await api.library.overview.$get({
        query: { range: search.range },
      });
      if (!res.ok) throw new Error("Failed to fetch library overview");
      return res.json();
    },
  });

export const artistsQuery = (search: SearchParams) =>
  useInfiniteQuery({
    queryKey: ["library", "artists", search.range],
    enabled: search.tab === "artists",
    initialPageParam: undefined as { playCount: number; id: string } | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await api.library.artists.$get({
        query: {
          range: search.range,
          limit: "30",
          ...(pageParam
            ? {
                cursorPlayCount: String(pageParam.playCount),
                cursorId: pageParam.id,
              }
            : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch artists");
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

export const albumsQuery = (search: SearchParams) =>
  useInfiniteQuery({
    queryKey: ["library", "albums", search.range],
    enabled: search.tab === "albums",
    initialPageParam: undefined as { playCount: number; id: string } | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await api.library.albums.$get({
        query: {
          range: search.range,
          limit: "30",
          ...(pageParam
            ? {
                cursorPlayCount: String(pageParam.playCount),
                cursorId: pageParam.id,
              }
            : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch albums");
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

export const tracksQuery = (search: SearchParams) =>
  useInfiniteQuery({
    queryKey: ["library", "tracks", search.range],
    enabled: search.tab === "tracks",
    initialPageParam: undefined as { playCount: number; id: string } | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await api.library.tracks.$get({
        query: {
          range: search.range,
          limit: "30",
          ...(pageParam
            ? {
                cursorPlayCount: String(pageParam.playCount),
                cursorId: pageParam.id,
              }
            : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch tracks");
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

export const scrobblesQuery = (search: SearchParams) =>
  useInfiniteQuery({
    queryKey: ["library", "scrobbles", search.range],
    enabled: search.tab === "scrobbles",
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await api.library.scrobbles.$get({
        query: {
          range: search.range,
          limit: "40",
          ...(pageParam ? { cursor: pageParam } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch scrobbles");
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
