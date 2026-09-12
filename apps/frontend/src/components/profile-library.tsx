import { Link } from "@tanstack/react-router";
import { Disc3, Music2, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { RankedList } from "@/components/ranked-list";
import { TimeRangeTabs } from "@/components/time-range-tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInfinityQuery } from "@/lib/hooks/use-infinity-query";
import { albumsQuery, artistsQuery, tracksQuery, useLibraryOverview } from "@/lib/queries/library";
import type { Range } from "@/lib/queries/stats";

type LibraryTab = "artists" | "albums" | "tracks";

interface ProfileLibraryProps {
  range: Range;
  tab: LibraryTab;
  onRangeChange: (range: Range) => void;
  onTabChange: (tab: LibraryTab) => void;
}

const LIBRARY_TABS = [
  { value: "artists", label: "Artists", icon: Users },
  { value: "albums", label: "Albums", icon: Disc3 },
  { value: "tracks", label: "Tracks", icon: Music2 },
] as const;

function isLibraryTab(value: string): value is LibraryTab {
  return LIBRARY_TABS.some((tab) => tab.value === value);
}

export function ProfileLibrary({ range, tab, onRangeChange, onTabChange }: ProfileLibraryProps) {
  const search = { range, tab };
  const { data: overview, isLoading: overviewLoading } = useLibraryOverview(search);
  const artistQuery = artistsQuery(search);
  const albumQuery = albumsQuery(search);
  const trackQuery = tracksQuery(search);

  const activeQuery = tab === "artists" ? artistQuery : tab === "albums" ? albumQuery : trackQuery;
  const hasItems = Boolean(activeQuery.data?.pages[0]?.items.length);
  const loadMoreRef = useInfinityQuery(activeQuery);

  const content = {
    artists: <ArtistsList pages={artistQuery.data?.pages ?? []} range={range} />,
    albums: <AlbumsList pages={albumQuery.data?.pages ?? []} range={range} />,
    tracks: <TracksList pages={trackQuery.data?.pages ?? []} range={range} />,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Library</h2>
          <p className="text-sm text-muted-foreground">Everything you’ve listened to, ranked.</p>
        </div>
        <div className="overflow-x-auto pb-1">
          <TimeRangeTabs value={range} onChange={onRangeChange} />
        </div>
      </div>

      {overviewLoading || !overview ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <LibraryMetric label="Streams" value={overview.totalScrobbles} />
          <LibraryMetric label="Artists" value={overview.totalArtists} />
          <LibraryMetric label="Albums" value={overview.totalAlbums} />
          <LibraryMetric label="Tracks" value={overview.totalTracks} />
        </div>
      )}

      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (isLibraryTab(value)) {
            onTabChange(value);
          }
        }}
      >
        <TabsList variant="line">
          {LIBRARY_TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value}>
              <Icon />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="min-w-0">
          {content[tab]}
          {activeQuery.isLoading ? <ListSkeleton /> : null}
          {!activeQuery.isLoading && !hasItems ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No {tab} yet</EmptyTitle>
                <EmptyDescription>Your listening history for this range is empty.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : null}
          {hasItems ? (
            <div ref={loadMoreRef} className="flex justify-center py-5">
              <p className="text-xs text-muted-foreground">
                {activeQuery.isFetchingNextPage
                  ? "Loading more…"
                  : activeQuery.hasNextPage
                    ? "Scroll to load more"
                    : "End of library"}
              </p>
            </div>
          ) : null}
        </section>

        <Card size="sm" className="xl:sticky xl:top-6">
          <CardHeader>
            <CardTitle>Listening by year</CardTitle>
            <CardDescription>
              {overview
                ? `${overview.averagePerDay.toLocaleString()} streams per day on average`
                : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : overview?.scrobblesByYear.length ? (
              <DateRangeBars data={overview.scrobblesByYear} />
            ) : (
              <p className="py-8 text-sm text-muted-foreground">No listening history yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LibraryMetric({ label, value }: { label: string; value: number }) {
  return (
    <Card size="sm">
      <CardHeader className="gap-0.5">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">
          {value.toLocaleString()}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

function ArtistsList({ pages, range }: { pages: Array<{ items: ArtistItem[] }>; range: Range }) {
  const items = pages.flatMap((page) => page.items);
  const max = getMax(items);
  return (
    <RankedList>
      {items.map((item, index) => (
        <RankedList.Item key={item.artist.id}>
          <RankedList.Link>
            <Link to="/artists/$artistId" params={{ artistId: item.artist.id }} search={{ range }}>
              <RankedList.Rank>{index + 1}</RankedList.Rank>
              <Avatar className="size-12">
                <AvatarImage src={item.artist.images?.[0]?.url} alt={item.artist.name} />
                <AvatarFallback>{item.artist.name[0]}</AvatarFallback>
              </Avatar>
              <RankedList.Body>
                <RankedList.Title>{item.artist.name}</RankedList.Title>
                <RankedList.Subtitle>
                  {item.albumCount} albums · {item.trackCount} tracks
                </RankedList.Subtitle>
              </RankedList.Body>
              <RankedList.Metric value={item.playCount} max={max} />
            </Link>
          </RankedList.Link>
        </RankedList.Item>
      ))}
    </RankedList>
  );
}

function AlbumsList({ pages, range }: { pages: Array<{ items: AlbumItem[] }>; range: Range }) {
  const items = pages.flatMap((page) => page.items);
  const max = getMax(items);
  return (
    <RankedList>
      {items.map((item, index) => (
        <RankedList.Item key={item.album.id}>
          <RankedList.Link>
            <Link to="/albums/$albumId" params={{ albumId: item.album.id }} search={{ range }}>
              <RankedList.Rank>{index + 1}</RankedList.Rank>
              <RankedList.Artwork>
                {item.album.images?.[0]?.url ? (
                  <RankedList.Image src={item.album.images[0].url} alt={item.album.name} />
                ) : (
                  <Disc3 />
                )}
              </RankedList.Artwork>
              <RankedList.Body>
                <RankedList.Title>{item.album.name}</RankedList.Title>
                <RankedList.Subtitle>{item.artistNames || "Unknown artist"}</RankedList.Subtitle>
              </RankedList.Body>
              <RankedList.Metric value={item.playCount} max={max} />
            </Link>
          </RankedList.Link>
        </RankedList.Item>
      ))}
    </RankedList>
  );
}

function TracksList({ pages, range }: { pages: Array<{ items: TrackItem[] }>; range: Range }) {
  const items = pages.flatMap((page) => page.items);
  const max = getMax(items);
  return (
    <RankedList>
      {items.map((item, index) => (
        <RankedList.Item key={item.track.id}>
          <RankedList.Link>
            <Link to="/tracks/$trackId" params={{ trackId: item.track.id }} search={{ range }}>
              <RankedList.Rank>{index + 1}</RankedList.Rank>
              <RankedList.Artwork>
                {item.album?.imageUrl ? (
                  <RankedList.Image src={item.album.imageUrl} alt={item.track.name} />
                ) : (
                  <Music2 />
                )}
              </RankedList.Artwork>
              <RankedList.Body>
                <RankedList.Title>{item.track.name}</RankedList.Title>
                <RankedList.Subtitle>
                  {item.artistNames || item.album?.name || "Unknown artist"}
                </RankedList.Subtitle>
              </RankedList.Body>
              <RankedList.Metric value={item.playCount} max={max} />
            </Link>
          </RankedList.Link>
        </RankedList.Item>
      ))}
    </RankedList>
  );
}

const chartConfig = {
  streams: { label: "Streams", color: "var(--chart-1)" },
} satisfies ChartConfig;

function DateRangeBars({ data }: { data: Array<{ year: number; count: number }> }) {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart
        accessibilityLayer
        data={data.map(({ year, count }) => ({ year: String(year), streams: count }))}
        layout="vertical"
        margin={{ left: 0, right: 4 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis type="number" hide />
        <YAxis dataKey="year" type="category" tickLine={false} axisLine={false} width={42} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
        <Bar dataKey="streams" fill="var(--color-streams)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Skeleton key={item} className="h-20" />
      ))}
    </div>
  );
}

function getMax(items: Array<{ playCount: number }>) {
  return Math.max(...items.map((item) => item.playCount), 1);
}

type ArtistItem = {
  artist: { id: string; name: string; images?: { url: string }[] | null };
  playCount: number;
  trackCount: number;
  albumCount: number;
};
type AlbumItem = {
  album: { id: string; name: string; images?: { url: string }[] | null };
  artistNames: string;
  playCount: number;
};
type TrackItem = {
  track: { id: string; name: string };
  album?: { name?: string | null; imageUrl?: string | null } | null;
  artistNames: string;
  playCount: number;
};
