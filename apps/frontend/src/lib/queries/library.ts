import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";

import { api } from "@/lib/api";

type SearchParams = {
  range: "7d" | "30d" | "90d" | "365d" | "all";
  tab: string;
};

type LibraryCursor = { playCount: number; id: string };
type LibraryQuery = {
  range: SearchParams["range"];
  limit: string;
  cursorPlayCount?: string;
  cursorId?: string;
};

function initialCursor(): LibraryCursor | undefined {
  return undefined;
}

function createLibraryQuery(range: SearchParams["range"], cursor: LibraryCursor | undefined) {
  const query: LibraryQuery = { range, limit: "30" };
  if (cursor) {
    query.cursorPlayCount = String(cursor.playCount);
    query.cursorId = cursor.id;
  }
  return query;
}

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
    initialPageParam: initialCursor(),
    queryFn: ({ pageParam }) =>
      parseResponse(
        api.library.artists.$get({
          query: createLibraryQuery(search.range, pageParam),
        }),
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

export const albumsQuery = (search: SearchParams) =>
  useInfiniteQuery({
    queryKey: ["library", "albums", search.range],
    enabled: search.tab === "albums",
    initialPageParam: initialCursor(),
    queryFn: ({ pageParam }) =>
      parseResponse(
        api.library.albums.$get({
          query: createLibraryQuery(search.range, pageParam),
        }),
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

export const tracksQuery = (search: SearchParams) =>
  useInfiniteQuery({
    queryKey: ["library", "tracks", search.range],
    enabled: search.tab === "tracks",
    initialPageParam: initialCursor(),
    queryFn: ({ pageParam }) =>
      parseResponse(
        api.library.tracks.$get({
          query: createLibraryQuery(search.range, pageParam),
        }),
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
