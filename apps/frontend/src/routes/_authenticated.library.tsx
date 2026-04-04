import { type UseInfiniteQueryResult } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Disc3, LibraryBig, Music2, Users } from "lucide-react";
import { useMemo, type ComponentProps, type ReactNode } from "react";
import { z } from "zod";

import { TimeRangeTabs } from "@/components/TimeRangeTabs";
import { TrackRow } from "@/components/TrackRow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  albumsQuery,
  artistsQuery,
  scrobblesQuery,
  tracksQuery,
  useLibraryOverview,
} from "@/features/api/library";
import { useInfinityQuery } from "@/hooks/useInfinityQuery";

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

  const { data: overview, isLoading: overviewLoading } =
    useLibraryOverview(search);
  const artQ = artistsQuery(search);
  const albQ = albumsQuery(search);
  const trackQ = tracksQuery(search);
  const scrobQ = scrobblesQuery(search);

  const tabBasedQuery: Record<
    "artists" | "albums" | "tracks",
    UseInfiniteQueryResult
  > = useMemo(
    () => ({
      artists: artQ,
      albums: albQ,
      tracks: trackQ,
    }),
    [artQ, albQ, trackQ],
  );

  const activeQuery =
    tabBasedQuery[search.tab as keyof typeof tabBasedQuery] || scrobQ;

  const hasItems = Boolean(
    (activeQuery.data as { pages: { items: unknown[] }[] })?.pages[0]?.items
      ?.length,
  );

  const loadMoreRef = useInfinityQuery(activeQuery);

  const TabToComponent: Record<string, ReactNode> = {
    scrobbles: <ScrobblesList pages={scrobQ.data?.pages || []} />,
    artists: <ArtistsList pages={artQ.data?.pages || []} />,
    albums: <AlbumsList pages={albQ.data?.pages || []} />,
    tracks: <TracksList pages={trackQ.data?.pages || []} />,
  };

  const statsCardData = [
    {
      label: "Scrobbles",
      value: overview?.totalScrobbles.toLocaleString(),
    },
    {
      label: "Artists",
      value: overview?.totalArtists.toLocaleString(),
    },
    {
      label: "Albums",
      value: overview?.totalAlbums.toLocaleString(),
    },
    {
      label: "Tracks",
      value: overview?.totalTracks.toLocaleString(),
      sub: `${overview?.averagePerDay} / day`,
    },
  ];

  const TabListComponent = TabToComponent[search.tab];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            Archive
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Library
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Browse every scrobble, artist, album, and track in one place.
          </p>
        </div>
        <TimeRangeTabs
          value={search.range}
          onChange={(range) =>
            navigate({ search: (prev) => ({ ...prev, range }) })
          }
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const active = search.tab === tab.value;
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() =>
                navigate({
                  search: (prev) => ({ ...prev, tab: tab.value }),
                })
              }
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {overviewLoading || !overview ? (
        <OverviewSkeleton />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="grid grid-cols-2 gap-3">
            {statsCardData.map((stat) => (
              <StatCard
                key={stat.label}
                {...(stat as ComponentProps<typeof StatCard>)}
              />
            ))}
          </div>
          <aside className="rounded-[1.75rem] border border-border/60 bg-card/30 p-5">
            <p className="text-sm font-semibold">Date Range</p>
            <div className="mt-5 space-y-3">
              {overview.scrobblesByYear.map(
                (item: { year: number; count: number }) => (
                  <div
                    key={item.year}
                    className="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-3"
                  >
                    <p className="text-xs text-muted-foreground">{item.year}</p>
                    <div className="flex items-center gap-3">
                      <div className="h-6 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-rose-200"
                          style={{
                            width: `${(item.count / Math.max(...overview.scrobblesByYear.map((row: { count: number }) => row.count), 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="w-12 text-right text-xs text-muted-foreground">
                        {item.count}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </aside>
        </div>
      )}

      <section className="rounded-[2rem] border border-border/60 bg-card/30 p-4 sm:p-5">
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
              <p className="text-sm text-muted-foreground">
                Scroll to load more
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                You’ve reached the end.
              </p>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}

const TABS = [
  { value: "scrobbles", label: "Scrobbles", icon: LibraryBig },
  { value: "artists", label: "Artists", icon: Users },
  { value: "albums", label: "Albums", icon: Disc3 },
  { value: "tracks", label: "Tracks", icon: Music2 },
] as const;

function ScrobblesList({ pages }: { pages: Array<{ items: ScrobbleItem[] }> }) {
  const items = pages.flatMap((page) => page.items);

  return (
    <ol className="space-y-2">
      {items.map((item, index) => (
        <li key={`${item.track.id}-${item.playedAt}-${index}`}>
          <TrackRow
            title={item.track.name}
            subtitle={
              <span className="inline-flex flex-wrap gap-x-1">
                {item.track.artists.map((artist, artistIndex) => (
                  <span key={artist.id}>
                    <Link
                      to="/artists/$artistId"
                      params={{ artistId: artist.id }}
                      className="hover:text-foreground"
                    >
                      {artist.name}
                    </Link>
                    {artistIndex < item.track.artists.length - 1 ? ", " : ""}
                  </span>
                ))}
              </span>
            }
            imageUrl={item.track.albumImageUrl}
            to={`/tracks/${item.track.id}`}
            leading={new Date(item.playedAt).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            })}
            trailing={new Date(item.playedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          />
        </li>
      ))}
    </ol>
  );
}

function ArtistsList({ pages }: { pages: Array<{ items: ArtistItem[] }> }) {
  const items = pages.flatMap((page) => page.items);

  return (
    <ol className="space-y-2">
      {items.map((item, index) => (
        <li key={item.artist.id}>
          <Link
            to="/artists/$artistId"
            params={{ artistId: item.artist.id }}
            className="flex items-center gap-4 rounded-[1.5rem] border border-border/60 bg-background/50 px-4 py-3 transition-colors hover:bg-card/70"
          >
            <div className="w-8 text-sm text-muted-foreground">{index + 1}</div>
            <Avatar className="size-12 rounded-2xl">
              <AvatarImage src={item.artist.images?.[0]?.url} />
              <AvatarFallback>{item.artist.name[0]}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.artist.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.playCount.toLocaleString()} plays •{" "}
                {item.albumCount.toLocaleString()} albums •{" "}
                {item.trackCount.toLocaleString()} tracks
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}

function AlbumsList({ pages }: { pages: Array<{ items: AlbumItem[] }> }) {
  const items = pages.flatMap((page) => page.items);

  return (
    <ol className="space-y-2">
      {items.map((item, index) => (
        <li key={item.album.id}>
          <Link
            to="/albums/$albumId"
            params={{ albumId: item.album.id }}
            className="flex items-center gap-4 rounded-[1.5rem] border border-border/60 bg-background/50 px-4 py-3 transition-colors hover:bg-card/70"
          >
            <div className="w-8 text-sm text-muted-foreground">{index + 1}</div>
            <div className="size-14 overflow-hidden rounded-2xl bg-muted">
              {item.album.images?.[0]?.url ? (
                <img
                  src={item.album.images[0].url}
                  alt=""
                  className="size-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.album.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.artistNames || "Unknown artist"}
                {item.album.releaseDate ? ` • ${item.album.releaseDate}` : ""}
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>{item.playCount.toLocaleString()} plays</p>
              <p>{item.trackCount.toLocaleString()} tracks</p>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}

function TracksList({ pages }: { pages: Array<{ items: TrackItem[] }> }) {
  const items = pages.flatMap((page) => page.items);

  return (
    <ol className="space-y-2">
      {items.map((item, index) => (
        <li key={item.track.id}>
          <TrackRow
            title={item.track.name}
            subtitle={
              <>
                {item.artistNames}
                {item.album?.name ? ` • ${item.album.name}` : ""}
              </>
            }
            imageUrl={item.album?.imageUrl}
            to={`/tracks/${item.track.id}`}
            leading={index + 1}
            trailing={`${item.playCount} plays`}
          />
        </li>
      ))}
    </ol>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-border/60 bg-card/40 p-5">
      <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      {sub ? <p className="mt-2 text-sm text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-[1.75rem]" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-[1.75rem]" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-20 w-full rounded-2xl" />
      ))}
    </div>
  );
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
