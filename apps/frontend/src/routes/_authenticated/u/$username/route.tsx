import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { CalendarDays, Clock3, Disc3, Gem, Music2, Radio, UserCheck, UserPlus } from "lucide-react";
import type React from "react";
import { z } from "zod";

import { ProfileLibrary } from "@/components/profile-library";
import { RankedList } from "@/components/ranked-list";
import { TimeRangeSelect } from "@/components/time-range-select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMeQuery } from "@/lib/queries/me";
import { useFollow, useFollows, useUnfollow } from "@/lib/queries/social";
import type { Range } from "@/lib/queries/stats";
import {
  useUserByUsernameQuery,
  useUserExtendedStatsQuery,
  useUserPlatinumAlbumsQuery,
  useUserStatsQuery,
} from "@/lib/queries/users";

const searchSchema = z.object({
  view: z.enum(["overview", "library"]).catch("overview"),
  tab: z.enum(["artists", "albums", "tracks"]).catch("artists"),
  range: z.enum(["7d", "30d", "90d", "365d", "all"]).catch("30d"),
  artistsRange: z.enum(["7d", "30d", "90d", "365d", "all"]).catch("30d"),
  albumsRange: z.enum(["7d", "30d", "90d", "365d", "all"]).catch("30d"),
  tracksRange: z.enum(["7d", "30d", "90d", "365d", "all"]).catch("30d"),
});

export const Route = createFileRoute("/_authenticated/u/$username")({
  validateSearch: searchSchema,
  component: ProfilePage,
});

function ProfilePage() {
  const { username } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: me } = useMeQuery();
  const { data: user, isError, isLoading } = useUserByUsernameQuery(username);
  const { data: follows } = useFollows();
  const follow = useFollow();
  const unfollow = useUnfollow();
  const { data: lifetimeStats } = useUserExtendedStatsQuery(user?.id, "all");
  const { data: extended, isLoading: extendedLoading } = useUserExtendedStatsQuery(user?.id, "all");
  const artistStats = useUserStatsQuery(user?.id, search.artistsRange);
  const albumStats = useUserStatsQuery(user?.id, search.albumsRange);
  const trackStats = useUserStatsQuery(user?.id, search.tracksRange);
  const platinumAlbums = useUserPlatinumAlbumsQuery(user?.id);

  if (isLoading) return <ProfileSkeleton />;
  if (isError || !user) return <ProfileUnavailable />;

  const isOwnProfile = me?.id === user.id;
  const activeView = search.view === "library" && !isOwnProfile ? "overview" : search.view;
  const isFollowing = follows?.following.some((item) => item.id === user.id) ?? false;
  const pendingFollow = follow.isPending || unfollow.isPending;
  const totalScrobbles = lifetimeStats?.totalScrobbles ?? extended?.totalScrobbles ?? 0;
  const listeningHours = Math.round((extended?.totalListeningMs ?? 0) / 3_600_000);
  const peakHour = getPeak(extended?.scrobblesByHour);
  const peakDay = getPeak(extended?.scrobblesByDayOfWeek);

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b bg-background">
        <div className="flex min-h-48 flex-col justify-end gap-6 px-6 pt-10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
            <Avatar className="size-28 shrink-0 ring-4 ring-background">
              <AvatarImage
                src={user.avatarUrl ?? undefined}
                alt={user.displayName}
                className="object-cover"
              />
              <AvatarFallback className="text-3xl">{getInitial(user.displayName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 pb-1">
              <h1 className="truncate text-4xl font-bold tracking-tight">{user.displayName}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                @{user.username} · listening since {dayjs(user.createdAt).format("D MMM YYYY")}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
                <ProfileMetric label="Streams" value={totalScrobbles} />
                <ProfileMetric label="Following" value={follows?.following.length ?? 0} />
                <ProfileMetric label="Followers" value={follows?.followers.length ?? 0} />
              </div>
              {user.bio ? (
                <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{user.bio}</p>
              ) : null}
            </div>
          </div>

          {!isOwnProfile ? (
            <Button
              variant={isFollowing ? "outline" : "default"}
              disabled={pendingFollow}
              onClick={() => (isFollowing ? unfollow.mutate(user.id) : follow.mutate(user.id))}
            >
              {isFollowing ? (
                <UserCheck data-icon="inline-start" />
              ) : (
                <UserPlus data-icon="inline-start" />
              )}
              {isFollowing ? "Following" : "Follow"}
            </Button>
          ) : null}
        </div>

        <nav className="overflow-x-auto px-6" aria-label="Profile">
          <Tabs
            value={activeView}
            onValueChange={(view) => {
              if (view === "overview" || view === "library") {
                void navigate({
                  search: (previous) => ({ ...previous, view }),
                  resetScroll: false,
                });
              }
            }}
          >
            <TabsList variant="line" className="h-12 gap-3">
              <TabsTrigger value="overview" className="px-3">
                Overview
              </TabsTrigger>
              {isOwnProfile ? (
                <TabsTrigger value="library" className="px-3">
                  Library
                </TabsTrigger>
              ) : null}
            </TabsList>
          </Tabs>
        </nav>
      </header>

      <main className="flex flex-col gap-8 px-6 py-8">
        {activeView === "library" ? (
          <ProfileLibrary
            range={search.range}
            tab={search.tab}
            onRangeChange={(range) =>
              navigate({ search: (previous) => ({ ...previous, range }), resetScroll: false })
            }
            onTabChange={(tab) =>
              navigate({ search: (previous) => ({ ...previous, tab }), resetScroll: false })
            }
          />
        ) : (
          <ProfileOverview
            artistsRange={search.artistsRange}
            albumsRange={search.albumsRange}
            tracksRange={search.tracksRange}
            onArtistsRangeChange={(artistsRange) =>
              navigate({
                search: (previous) => ({ ...previous, artistsRange }),
                resetScroll: false,
              })
            }
            onAlbumsRangeChange={(albumsRange) =>
              navigate({
                search: (previous) => ({ ...previous, albumsRange }),
                resetScroll: false,
              })
            }
            onTracksRangeChange={(tracksRange) =>
              navigate({
                search: (previous) => ({ ...previous, tracksRange }),
                resetScroll: false,
              })
            }
            artistStats={artistStats.data}
            albumStats={albumStats.data}
            trackStats={trackStats.data}
            platinumAlbums={platinumAlbums.data}
            artistStatsLoading={artistStats.isLoading}
            albumStatsLoading={albumStats.isLoading}
            trackStatsLoading={trackStats.isLoading}
            platinumAlbumsLoading={platinumAlbums.isLoading}
            extended={extended}
            extendedLoading={extendedLoading}
            listeningHours={listeningHours}
            peakHour={peakHour}
            peakDay={peakDay}
          />
        )}
      </main>
    </div>
  );
}

interface ProfileOverviewProps {
  artistsRange: Range;
  albumsRange: Range;
  tracksRange: Range;
  onArtistsRangeChange: (range: Range) => void;
  onAlbumsRangeChange: (range: Range) => void;
  onTracksRangeChange: (range: Range) => void;
  artistStats?: UserStats;
  albumStats?: UserStats;
  trackStats?: UserStats;
  platinumAlbums?: PlatinumAlbums;
  artistStatsLoading: boolean;
  albumStatsLoading: boolean;
  trackStatsLoading: boolean;
  platinumAlbumsLoading: boolean;
  extended?: ExtendedStats;
  extendedLoading: boolean;
  listeningHours: number;
  peakHour: Peak | null;
  peakDay: Peak | null;
}

function ProfileOverview({
  artistsRange,
  albumsRange,
  tracksRange,
  onArtistsRangeChange,
  onAlbumsRangeChange,
  onTracksRangeChange,
  artistStats,
  albumStats,
  trackStats,
  platinumAlbums,
  artistStatsLoading,
  albumStatsLoading,
  trackStatsLoading,
  platinumAlbumsLoading,
  extended,
  extendedLoading,
  listeningHours,
  peakHour,
  peakDay,
}: ProfileOverviewProps) {
  return (
    <div className="flex flex-col gap-8">
      <MediaSection>
        <MediaSection.Header>
          <h2 className="text-xl font-semibold">Top artists</h2>
          <TimeRangeSelect value={artistsRange} onChange={onArtistsRangeChange} />
        </MediaSection.Header>
        {artistStatsLoading && !artistStats ? (
          <MediaGridSkeleton />
        ) : artistStats?.topArtists.length ? (
          <ArtistGrid artists={artistStats.topArtists.slice(0, 8)} />
        ) : (
          <SectionEmpty title="No top artists" />
        )}
      </MediaSection>

      <MediaSection>
        <MediaSection.Header>
          <h2 className="text-xl font-semibold">Top albums</h2>
          <TimeRangeSelect value={albumsRange} onChange={onAlbumsRangeChange} />
        </MediaSection.Header>
        {albumStatsLoading && !albumStats ? (
          <MediaGridSkeleton square />
        ) : albumStats?.topAlbums.length ? (
          <AlbumGrid albums={albumStats.topAlbums.slice(0, 8)} />
        ) : (
          <SectionEmpty title="No top albums" />
        )}
      </MediaSection>

      {platinumAlbumsLoading || platinumAlbums?.length ? (
        <MediaSection>
          <MediaSection.Header>
            <div>
              <h2 className="text-xl font-semibold">Platinum albums</h2>
              <p className="text-sm text-muted-foreground">Every track is saved to Liked Songs.</p>
            </div>
          </MediaSection.Header>
          {platinumAlbumsLoading && !platinumAlbums ? (
            <MediaGridSkeleton square />
          ) : platinumAlbums?.length ? (
            <PlatinumAlbumGrid albums={platinumAlbums} />
          ) : null}
        </MediaSection>
      ) : null}

      <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <MediaSection>
          <MediaSection.Header>
            <h2 className="text-xl font-semibold">Top tracks</h2>
            <TimeRangeSelect value={tracksRange} onChange={onTracksRangeChange} />
          </MediaSection.Header>
          {trackStatsLoading && !trackStats ? (
            <ListSkeleton />
          ) : trackStats?.topTracks.length ? (
            <TopTracks tracks={trackStats.topTracks} />
          ) : (
            <SectionEmpty title="No top tracks" />
          )}
        </MediaSection>

        <aside className="flex min-w-0 flex-col gap-6">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Taste profile</h2>
            {extendedLoading && !extended ? (
              <Skeleton className="h-28" />
            ) : (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
                <TasteMetric icon={Music2} label="Streams">
                  {(extended?.totalScrobbles ?? 0).toLocaleString()}
                </TasteMetric>
                <TasteMetric icon={Clock3} label="Listening hours">
                  {listeningHours.toLocaleString()}
                </TasteMetric>
                <TasteMetric icon={Radio} label="Peak hour">
                  {peakHour ? formatHour(peakHour.key) : "No data"}
                </TasteMetric>
                <TasteMetric icon={CalendarDays} label="Peak day">
                  {peakDay ? DAY_NAMES[peakDay.key] : "No data"}
                </TasteMetric>
              </dl>
            )}
          </section>

          <Separator />

          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Top genres</h2>
            {extended?.topGenres.length ? (
              <GenreList genres={extended.topGenres} />
            ) : (
              <p className="text-sm text-muted-foreground">No genre data yet.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function MediaSectionRoot({ children }: { children: React.ReactNode }) {
  return <section className="flex min-w-0 flex-col gap-3">{children}</section>;
}

function MediaSectionHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4">{children}</div>;
}

const MediaSection = Object.assign(MediaSectionRoot, { Header: MediaSectionHeader });

function ArtistGrid({ artists }: { artists: UserStats["topArtists"] }) {
  return (
    <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 xl:grid-cols-8">
      {artists.map(({ artist, playCount }) => (
        <Link
          key={artist.id}
          to="/artists/$artistId"
          params={{ artistId: artist.id }}
          className="group relative aspect-[4/5] overflow-hidden bg-muted"
        >
          {artist.images?.[0]?.url ? (
            <img
              src={artist.images[0].url}
              alt=""
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Music2 />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10 text-white">
            <p className="truncate text-sm font-semibold">{artist.name}</p>
            <p className="text-xs text-white/75">{formatPlays(playCount)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function AlbumGrid({ albums }: { albums: UserStats["topAlbums"] }) {
  return (
    <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 xl:grid-cols-8">
      {albums.map(({ album, artistNames, playCount }) => (
        <Link
          key={album.id}
          to="/albums/$albumId"
          params={{ albumId: album.id }}
          className="group relative aspect-square overflow-hidden bg-muted"
        >
          {album.images?.[0]?.url ? (
            <img
              src={album.images[0].url}
              alt=""
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Disc3 />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10 text-white">
            <p className="truncate text-sm font-semibold">{album.name}</p>
            <p className="truncate text-xs text-white/75">
              {artistNames} · {formatPlays(playCount)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function PlatinumAlbumGrid({ albums }: { albums: PlatinumAlbums }) {
  return (
    <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 xl:grid-cols-8">
      {albums.map(({ album, artistNames }) => (
        <Link
          key={album.id}
          to="/albums/$albumId"
          params={{ albumId: album.id }}
          className="group relative aspect-square overflow-hidden bg-muted"
        >
          {album.images?.[0]?.url ? (
            <img
              src={album.images[0].url}
              alt=""
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Disc3 />
            </div>
          )}
          <Badge variant="secondary" className="absolute top-2 right-2">
            <Gem data-icon="inline-start" />
            Platinum
          </Badge>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10 text-white">
            <p className="truncate text-sm font-semibold">{album.name}</p>
            <p className="truncate text-xs text-white/75">
              {artistNames} · {album.totalTracks?.toLocaleString()} tracks
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function TopTracks({ tracks }: { tracks: UserStats["topTracks"] }) {
  const max = Math.max(...tracks.map((item) => item.playCount), 1);
  return (
    <RankedList>
      {tracks.map(({ track, playCount }, index) => (
        <RankedList.Item key={track.id}>
          <RankedList.Link>
            <Link to="/tracks/$trackId" params={{ trackId: track.id }}>
              <RankedList.Rank>{index + 1}</RankedList.Rank>
              <RankedList.Artwork>
                {track.albumImageUrl ? (
                  <RankedList.Image src={track.albumImageUrl} alt="" />
                ) : (
                  <Music2 />
                )}
              </RankedList.Artwork>
              <RankedList.Body>
                <RankedList.Title>{track.name}</RankedList.Title>
                <RankedList.Subtitle>{formatPlays(playCount)}</RankedList.Subtitle>
              </RankedList.Body>
              <RankedList.Metric value={playCount} max={max} />
            </Link>
          </RankedList.Link>
        </RankedList.Item>
      ))}
    </RankedList>
  );
}

function GenreList({ genres }: { genres: Array<{ genre: string; count: number }> }) {
  const max = Math.max(...genres.map((genre) => genre.count), 1);
  return (
    <div className="flex flex-col gap-3">
      {genres.slice(0, 6).map(({ genre, count }) => (
        <div key={genre} className="flex flex-col gap-1.5">
          <div className="flex justify-between gap-3 text-sm">
            <span className="truncate capitalize">{genre}</span>
            <span className="text-muted-foreground tabular-nums">{count}</span>
          </div>
          <Progress value={(count / max) * 100} className="h-1.5" />
        </div>
      ))}
    </div>
  );
}

function ProfileMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value.toLocaleString()}</p>
    </div>
  );
}

function TasteMetric({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[1.75rem_minmax(0,1fr)] gap-x-2">
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <div className="flex min-w-0 flex-col">
        <dt className="order-2 truncate text-xs text-muted-foreground">{label}</dt>
        <dd className="order-1 truncate text-sm font-semibold">{children}</dd>
      </div>
    </div>
  );
}

function ProfileUnavailable() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile unavailable</CardTitle>
          <CardDescription>This profile is private, missing, or unavailable.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex items-end gap-4">
        <Skeleton className="size-28 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
      <MediaGridSkeleton />
      <ListSkeleton />
    </div>
  );
}

function MediaGridSkeleton({ square = false }: { square?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 xl:grid-cols-8">
      {Array.from({ length: 8 }, (_, index) => (
        <Skeleton key={index} className={square ? "aspect-square" : "aspect-[4/5]"} />
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Skeleton key={item} className="h-16" />
      ))}
    </div>
  );
}

function SectionEmpty({ title }: { title: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>There is no listening data for this range yet.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function getPeak(items?: Array<{ count: number; dow?: number; hour?: number }>) {
  if (!items?.length) return null;
  return items.reduce<Peak | null>((peak, item) => {
    const key = item.hour ?? item.dow;
    if (key === undefined) return peak;
    return !peak || item.count > peak.count ? { key, count: item.count } : peak;
  }, null);
}

function formatHour(hour: number) {
  return dayjs().hour(hour).minute(0).format("h A");
}
function formatPlays(count: number) {
  return `${count.toLocaleString()} ${count === 1 ? "play" : "plays"}`;
}
function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
type Peak = { key: number; count: number };
type UserStats = NonNullable<ReturnType<typeof useUserStatsQuery>["data"]>;
type ExtendedStats = NonNullable<ReturnType<typeof useUserExtendedStatsQuery>["data"]>;
type PlatinumAlbums = NonNullable<ReturnType<typeof useUserPlatinumAlbumsQuery>["data"]>;
