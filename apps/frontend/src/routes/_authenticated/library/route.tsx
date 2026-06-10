import { type UseInfiniteQueryResult } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Disc3, LibraryBig, Music2, Users } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { z } from "zod";

import { Page, PageSection, PageSectionTitle } from "@/components/page-shell";
import { RankedList } from "@/components/ranked-list";
import { TimeRangeTabs } from "@/components/time-range-tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInfinityQuery } from "@/lib/hooks/use-infinity-query";
import {
  albumsQuery,
  artistsQuery,
  scrobblesQuery,
  tracksQuery,
  useLibraryOverview,
} from "@/lib/queries/library";
import type { Range } from "@/lib/queries/stats";

const searchSchema = z.object({
  tab: z.enum(["scrobbles", "artists", "albums", "tracks"]).catch("scrobbles"),
  range: z.enum(["7d", "30d", "90d", "365d", "all"]).catch("all"),
});

export const Route = createFileRoute("/_authenticated/library")({
  validateSearch: searchSchema,
  component: LibraryPage,
});

function LibraryPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: overview, isLoading: overviewLoading } = useLibraryOverview(search);
  const artQ = artistsQuery(search);
  const albQ = albumsQuery(search);
  const trackQ = tracksQuery(search);
  const scrobQ = scrobblesQuery(search);

  const tabBasedQuery: Record<"artists" | "albums" | "tracks", UseInfiniteQueryResult> = useMemo(
    () => ({
      artists: artQ,
      albums: albQ,
      tracks: trackQ,
    }),
    [artQ, albQ, trackQ],
  );

  const activeQuery = tabBasedQuery[search.tab as keyof typeof tabBasedQuery] || scrobQ;

  const hasItems = Boolean(
    (activeQuery.data as { pages: { items: unknown[] }[] })?.pages[0]?.items?.length,
  );

  const loadMoreRef = useInfinityQuery(activeQuery);

  const TabToComponent: Record<string, ReactNode> = {
    scrobbles: <ScrobblesList pages={scrobQ.data?.pages || []} />,
    artists: <ArtistsList pages={artQ.data?.pages || []} />,
    albums: <AlbumsList pages={albQ.data?.pages || []} />,
    tracks: <TracksList pages={trackQ.data?.pages || []} />,
  };

  const TabListComponent = TabToComponent[search.tab];
  const activeTab = TABS.find((tab) => tab.value === search.tab);
  const listTitle = search.tab === "scrobbles" ? "Today" : (activeTab?.label ?? "Library");

  return (
    <Page className="gap-8 pt-4">
      <Tabs
        value={search.tab}
        onValueChange={(tab) =>
          navigate({
            search: (prev) => ({ ...prev, tab: tab as (typeof TABS)[number]["value"] }),
          })
        }
      >
        <TabsList>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value}>
                <Icon />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.45fr)]">
        <section className="flex min-w-0 flex-col gap-8">
          {overviewLoading || !overview ? (
            <OverviewSkeleton />
          ) : (
            <div className="flex flex-wrap gap-x-12 gap-y-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-muted-foreground">Streams</p>
                <p className="text-3xl font-bold text-foreground tabular-nums">
                  {overview.totalScrobbles.toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-muted-foreground">
                  Streams per day (average)
                </p>
                <p className="text-3xl font-bold text-foreground tabular-nums">
                  {overview.averagePerDay.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <PageSection>
            <PageSectionTitle className="text-2xl font-medium text-muted-foreground">
              {listTitle}
            </PageSectionTitle>
            <div className="flex flex-col gap-4">
              {TabListComponent}
              {activeQuery.isLoading ? <ListSkeleton /> : null}

              {!activeQuery.isLoading && !hasItems ? (
                <p className="py-8 text-sm text-muted-foreground">
                  No library data for this range yet.
                </p>
              ) : null}

              {hasItems ? (
                <div ref={loadMoreRef} className="flex justify-center py-4">
                  {activeQuery.isFetchingNextPage ? (
                    <p className="text-sm text-muted-foreground">Loading more…</p>
                  ) : activeQuery.hasNextPage ? (
                    <p className="text-sm text-muted-foreground">Scroll to load more</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">You’ve reached the end.</p>
                  )}
                </div>
              ) : null}
            </div>
          </PageSection>
        </section>

        <DateRangePanel
          data={overview?.scrobblesByYear ?? []}
          isLoading={overviewLoading}
          range={search.range}
          onRangeChange={(range) => navigate({ search: (prev) => ({ ...prev, range }) })}
        />
      </div>
    </Page>
  );
}

const TABS = [
  { value: "scrobbles", label: "Streams", icon: LibraryBig },
  { value: "artists", label: "Artists", icon: Users },
  { value: "albums", label: "Albums", icon: Disc3 },
  { value: "tracks", label: "Tracks", icon: Music2 },
] as const;

function ScrobblesList({ pages }: { pages: Array<{ items: ScrobbleItem[] }> }) {
  const items = pages.flatMap((page) => page.items);

  return (
    <ol className="flex flex-col border-y border-border/70">
      {items.map((item, index) => (
        <ScrobbleRow key={`${item.track.id}-${item.playedAt}-${index}`} item={item} />
      ))}
    </ol>
  );
}

function ScrobbleRow({ item }: { item: ScrobbleItem }) {
  return (
    <li className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/70 py-2.5 last:border-b-0">
      <Link
        to="/tracks/$trackId"
        params={{ trackId: item.track.id }}
        className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground"
      >
        {item.track.albumImageUrl ? (
          <img src={item.track.albumImageUrl} alt="" className="size-full object-cover" />
        ) : (
          <Music2 className="size-4" />
        )}
      </Link>

      <div className="min-w-0">
        <Link
          to="/tracks/$trackId"
          params={{ trackId: item.track.id }}
          className="block truncate text-sm font-semibold hover:text-primary"
        >
          {item.track.name}
        </Link>
        <p className="truncate text-xs text-muted-foreground">
          {formatArtistNames(item.track.artists)}
        </p>
      </div>

      <p className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
        {relativeTime(item.playedAt)}
      </p>
    </li>
  );
}

function ArtistsList({ pages }: { pages: Array<{ items: ArtistItem[] }> }) {
  const items = pages.flatMap((page) => page.items);
  const maxPlayCount = getMaxPlayCount(items);

  return (
    <RankedList>
      {items.map((item, index) => (
        <RankedList.Item key={item.artist.id}>
          <RankedList.Link>
            <Link to="/artists/$artistId" params={{ artistId: item.artist.id }}>
              <RankedList.Rank>{index + 1}</RankedList.Rank>
              <Avatar size="lg" className="size-11 sm:size-12">
                <AvatarImage src={item.artist.images?.[0]?.url} alt={item.artist.name} />
                <AvatarFallback>{item.artist.name[0]}</AvatarFallback>
              </Avatar>
              <RankedList.Body>
                <RankedList.Title>{item.artist.name}</RankedList.Title>
                <RankedList.Subtitle className="text-xs sm:hidden">
                  {formatScrobbleCount(item.playCount)} • {item.albumCount.toLocaleString()} albums
                  • {item.trackCount.toLocaleString()} tracks
                </RankedList.Subtitle>
              </RankedList.Body>
              <RankedList.Metric value={item.playCount} max={maxPlayCount} />
            </Link>
          </RankedList.Link>
        </RankedList.Item>
      ))}
    </RankedList>
  );
}

function AlbumsList({ pages }: { pages: Array<{ items: AlbumItem[] }> }) {
  const items = pages.flatMap((page) => page.items);
  const maxPlayCount = getMaxPlayCount(items);

  return (
    <RankedList>
      {items.map((item, index) => (
        <RankedList.Item key={item.album.id}>
          <RankedList.Link>
            <Link to="/albums/$albumId" params={{ albumId: item.album.id }}>
              <RankedList.Rank>{index + 1}</RankedList.Rank>
              <RankedList.Artwork>
                {item.album.images?.[0]?.url ? (
                  <RankedList.Image src={item.album.images[0].url} alt={item.album.name} />
                ) : (
                  <Disc3 className="size-4" />
                )}
              </RankedList.Artwork>
              <RankedList.Body>
                <RankedList.Title>{item.album.name}</RankedList.Title>
                <RankedList.Subtitle>
                  {item.artistNames || "Unknown artist"}
                  {item.album.releaseDate ? ` • ${item.album.releaseDate}` : ""}
                  <span className="sm:hidden"> • {formatScrobbleCount(item.playCount)}</span>
                </RankedList.Subtitle>
              </RankedList.Body>
              <RankedList.Metric value={item.playCount} max={maxPlayCount} />
            </Link>
          </RankedList.Link>
        </RankedList.Item>
      ))}
    </RankedList>
  );
}

function TracksList({ pages }: { pages: Array<{ items: TrackItem[] }> }) {
  const items = pages.flatMap((page) => page.items);
  const maxPlayCount = getMaxPlayCount(items);

  return (
    <RankedList>
      {items.map((item, index) => (
        <RankedList.Item key={item.track.id}>
          <RankedList.Link>
            <Link to="/tracks/$trackId" params={{ trackId: item.track.id }}>
              <RankedList.Rank>{index + 1}</RankedList.Rank>
              <RankedList.Artwork>
                {item.album?.imageUrl ? (
                  <RankedList.Image src={item.album.imageUrl} alt={item.track.name} />
                ) : (
                  <Music2 className="size-4" />
                )}
              </RankedList.Artwork>
              <RankedList.Body>
                <RankedList.Title>{item.track.name}</RankedList.Title>
                <RankedList.Subtitle>
                  {item.artistNames || item.album?.name || "Unknown artist"}
                  <span className="sm:hidden"> • {formatScrobbleCount(item.playCount)}</span>
                </RankedList.Subtitle>
              </RankedList.Body>
              <RankedList.Metric value={item.playCount} max={maxPlayCount} />
            </Link>
          </RankedList.Link>
        </RankedList.Item>
      ))}
    </RankedList>
  );
}

function OverviewSkeleton() {
  return (
    <div className="flex flex-wrap gap-x-12 gap-y-4">
      <Skeleton className="h-14 w-28" />
      <Skeleton className="h-14 w-48" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

function DateRangePanel({
  data,
  isLoading,
  range,
  onRangeChange,
}: {
  data: DateRangeItem[];
  isLoading: boolean;
  range: Range;
  onRangeChange: (range: Range) => void;
}) {
  return (
    <aside className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between xl:flex-col xl:items-stretch 2xl:flex-row 2xl:items-start">
        <h2 className="text-2xl font-medium">Date Range</h2>
        <div className="overflow-x-auto">
          <TimeRangeTabs value={range} onChange={onRangeChange} />
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-80 w-full" />
      ) : data.length > 0 ? (
        <DateRangeBars data={data} />
      ) : (
        <p className="text-sm text-muted-foreground">No date range data yet.</p>
      )}
    </aside>
  );
}

function DateRangeBars({ data }: { data: DateRangeItem[] }) {
  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {data.map((item) => (
          <div key={item.year} className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3">
            <p className="text-sm text-muted-foreground tabular-nums">{item.year}</p>
            <div className="relative h-9 overflow-hidden">
              <div
                className="h-full bg-destructive/15"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-sm font-semibold text-muted-foreground">Scrobbles</p>
    </div>
  );
}

function formatArtistNames(artists: ScrobbleItem["track"]["artists"]) {
  return artists.map((artist) => artist.name).join(", ");
}

function getMaxPlayCount(items: Array<{ playCount: number }>) {
  return Math.max(...items.map((item) => item.playCount), 1);
}

function formatScrobbleCount(value: number) {
  return `${value.toLocaleString()} ${value === 1 ? "scrobble" : "scrobbles"}`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diff / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

type ScrobbleItem = {
  playedAt: string;
  track: {
    id: string;
    name: string;
    albumImageUrl?: string | null;
    artists: Array<{ id: string; name: string }>;
  };
};

type ArtistItem = {
  artist: { id: string; name: string; images?: { url: string }[] | null };
  playCount: number;
  trackCount: number;
  albumCount: number;
};

type AlbumItem = {
  album: {
    id: string;
    name: string;
    releaseDate?: string | null;
    images?: { url: string }[] | null;
  };
  artistNames: string;
  playCount: number;
  trackCount: number;
};

type TrackItem = {
  track: { id: string; name: string };
  album?: {
    id?: string | null;
    name?: string | null;
    imageUrl?: string | null;
  } | null;
  artistNames: string;
  playCount: number;
};

type DateRangeItem = {
  year: number;
  count: number;
};
