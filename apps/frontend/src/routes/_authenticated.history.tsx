import { useInfiniteQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { TrackRow } from "@/components/TrackRow";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["me", "history"],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await api.me.history.$get({
        query: {
          limit: "50",
          ...(pageParam ? { before: pageParam } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch history");
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting && !isFetchingNextPage) {
        void fetchNextPage();
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const grouped = new Map<string, typeof items>();
  for (const item of items) {
    const date = new Date(item.playedAt).toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!grouped.has(date)) grouped.set(date, []);
    grouped.get(date)!.push(item);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          Archive
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Listening History</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          A chronological view of what you played, with timestamps, artists, and durations.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-48" />
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-10 w-full" />
              ))}
            </div>
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="space-y-8">
          {[...grouped.entries()].map(([date, dayItems]) => (
            <section
              key={date}
              className="rounded-[1.75rem] border border-border/60 bg-card/30 p-4 sm:p-5"
            >
              <h2 className="mb-4 text-sm font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                {date}
              </h2>
              <ol className="space-y-2">
                {dayItems.map((item, i) => (
                  <li key={i}>
                    <TrackRow
                      title={item.track.name}
                      subtitle={
                        <span className="inline-flex flex-wrap gap-x-1">
                          {item.track.artists.map((artist, index) => (
                            <span key={artist.id}>
                              <Link
                                to="/artists/$artistId"
                                params={{ artistId: artist.id }}
                                className="hover:text-foreground"
                              >
                                {artist.name}
                              </Link>
                              {index < item.track.artists.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </span>
                      }
                      imageUrl={item.track.albumImageUrl}
                      to={`/tracks/${item.track.id}`}
                      leading={new Date(item.playedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                      trailing={formatDuration(item.track.durationMs)}
                    />
                  </li>
                ))}
              </ol>
            </section>
          ))}

          {items.length === 0 && <p className="text-muted-foreground">No listening history yet.</p>}

          {items.length > 0 && (
            <div ref={loadMoreRef} className="flex justify-center py-2">
              {isFetchingNextPage ? (
                <p className="text-sm text-muted-foreground">Loading more history...</p>
              ) : hasNextPage ? (
                <p className="text-sm text-muted-foreground">Scroll to load more</p>
              ) : (
                <p className="text-sm text-muted-foreground">You’ve reached the beginning.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatDuration(durationMs: number | null) {
  if (!durationMs) {
    return null;
  }

  return `${Math.floor(durationMs / 60000)}:${String(Math.floor((durationMs % 60000) / 1000)).padStart(2, "0")}`;
}
