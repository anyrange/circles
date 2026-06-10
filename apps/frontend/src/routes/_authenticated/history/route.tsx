import { Link, createFileRoute } from "@tanstack/react-router";

import { Page, PageDescription, PageHeader, PageTitle } from "@/components/page-shell";
import { TrackRow } from "@/components/track-row";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfinityQuery } from "@/lib/hooks/use-infinity-query";
import { useHistoryQuery } from "@/lib/queries/history";

export const Route = createFileRoute("/_authenticated/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const historyQuery = useHistoryQuery();
  const { data, isLoading, isFetchingNextPage, hasNextPage } = historyQuery;
  const loadMoreRef = useInfinityQuery(historyQuery);

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
    <Page>
      <PageHeader>
        <PageTitle>Listening history</PageTitle>
        <PageDescription>
          A chronological view of what you played, with timestamps, artists, and durations.
        </PageDescription>
      </PageHeader>

      {isLoading && (
        <div className="flex flex-col gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-5 w-48" />
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-10 w-full" />
              ))}
            </div>
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="flex flex-col gap-8">
          {[...grouped.entries()].map(([date, dayItems]) => (
            <section key={date} className="flex flex-col gap-4">
              <h2 className="text-base font-semibold">{date}</h2>
              <ol className="flex flex-col gap-2">
                {dayItems.map((item, i) => (
                  <li key={i}>
                    <TrackRow>
                      <TrackRow.Leading>
                        {new Date(item.playedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </TrackRow.Leading>
                      <TrackRow.Artwork>
                        {item.track.albumImageUrl ? (
                          <TrackRow.Image src={item.track.albumImageUrl} alt="" />
                        ) : null}
                      </TrackRow.Artwork>
                      <TrackRow.Content>
                        <TrackRow.Title>
                          <Link
                            to="/tracks/$trackId"
                            params={{ trackId: item.track.id }}
                            className="hover:text-muted-foreground"
                          >
                            {item.track.name}
                          </Link>
                        </TrackRow.Title>
                        <TrackRow.Subtitle>
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
                        </TrackRow.Subtitle>
                      </TrackRow.Content>
                      {formatDuration(item.track.durationMs) ? (
                        <TrackRow.Trailing>
                          {formatDuration(item.track.durationMs)}
                        </TrackRow.Trailing>
                      ) : null}
                    </TrackRow>
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
    </Page>
  );
}

function formatDuration(durationMs: number | null) {
  if (!durationMs) {
    return null;
  }

  return `${Math.floor(durationMs / 60000)}:${String(Math.floor((durationMs % 60000) / 1000)).padStart(2, "0")}`;
}
