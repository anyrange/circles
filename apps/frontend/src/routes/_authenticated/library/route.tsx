import { type UseInfiniteQueryResult } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Disc3, Music2, Users } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { z } from "zod";

import { Page, PageSection, PageSectionTitle } from "@/components/page-shell";
import { RankedList } from "@/components/ranked-list";
import { TimeRangeTabs } from "@/components/time-range-tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInfinityQuery } from "@/lib/hooks/use-infinity-query";
import { albumsQuery, artistsQuery, tracksQuery, useLibraryOverview } from "@/lib/queries/library";
import type { Range } from "@/lib/queries/stats";

const searchSchema = z.object({
  tab: z.enum(["artists", "albums", "tracks"]).catch("artists"),
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

  const tabBasedQuery: Record<"artists" | "albums" | "tracks", UseInfiniteQueryResult> = useMemo(
    () => ({
      artists: artQ,
      albums: albQ,
      tracks: trackQ,
    }),
    [artQ, albQ, trackQ],
  );

  const activeQuery = tabBasedQuery[search.tab];

  const hasItems = Boolean(
    (activeQuery.data as { pages: { items: unknown[] }[] })?.pages[0]?.items?.length,
  );

  const loadMoreRef = useInfinityQuery(activeQuery);

  const TabToComponent: Record<string, ReactNode> = {
    artists: <ArtistsList pages={artQ.data?.pages || []} />,
    albums: <AlbumsList pages={albQ.data?.pages || []} />,
    tracks: <TracksList pages={trackQ.data?.pages || []} />,
  };

  const TabListComponent = TabToComponent[search.tab];
  const activeTab = TABS.find((tab) => tab.value === search.tab);
  const listTitle = activeTab?.label ?? "Library";

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
  { value: "artists", label: "Artists", icon: Users },
  { value: "albums", label: "Albums", icon: Disc3 },
  { value: "tracks", label: "Tracks", icon: Music2 },
] as const;

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
                  {formatStreamCount(item.playCount)} • {item.albumCount.toLocaleString()} albums •{" "}
                  {item.trackCount.toLocaleString()} tracks
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
                  <span className="sm:hidden"> • {formatStreamCount(item.playCount)}</span>
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
                  <span className="sm:hidden"> • {formatStreamCount(item.playCount)}</span>
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

const dateRangeChartConfig = {
  streams: {
    label: "Streams",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function DateRangeBars({ data }: { data: DateRangeItem[] }) {
  const chartData = data.map((item) => ({
    year: String(item.year),
    streams: item.count,
  }));

  return (
    <ChartContainer config={dateRangeChartConfig} className="h-64 w-full">
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{ left: 0, right: 8 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          dataKey="year"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={48}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
        <Bar dataKey="streams" fill="var(--color-streams)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

function getMaxPlayCount(items: Array<{ playCount: number }>) {
  return Math.max(...items.map((item) => item.playCount), 1);
}

function formatStreamCount(value: number) {
  return `${value.toLocaleString()} ${value === 1 ? "stream" : "streams"}`;
}

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
