import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";

import { api } from "@/lib/api";

type SearchParams = {
  range: "7d" | "30d" | "90d" | "365d" | "all";
  tab: string;
};

export const useLibraryOverview = (search: SearchParams) =>
  useQuery({
    queryKey: ["library", "overview", search.range],
    queryFn: () =>
      parseResponse(
        api.library.overview.$get({
          query: { range: search.range },
        }),
      ),
  });

export const artistsQuery = (search: SearchParams) =>
  useInfiniteQuery({
    queryKey: ["library", "artists", search.range],
    enabled: search.tab === "artists",
    initialPageParam: undefined as { playCount: number; id: string } | undefined,
    queryFn: ({ pageParam }) =>
      parseResponse(
        api.library.artists.$get({
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
        }),
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

export const albumsQuery = (search: SearchParams) =>
  useInfiniteQuery({
    queryKey: ["library", "albums", search.range],
    enabled: search.tab === "albums",
    initialPageParam: undefined as { playCount: number; id: string } | undefined,
    queryFn: ({ pageParam }) =>
      parseResponse(
        api.library.albums.$get({
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
        }),
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

export const tracksQuery = (search: SearchParams) =>
  useInfiniteQuery({
    queryKey: ["library", "tracks", search.range],
    enabled: search.tab === "tracks",
    initialPageParam: undefined as { playCount: number; id: string } | undefined,
    queryFn: ({ pageParam }) =>
      parseResponse(
        api.library.tracks.$get({
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
        }),
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
