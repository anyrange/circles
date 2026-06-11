import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { CalendarDays, Clock3, Music2, Radio, UserCheck, UserPlus } from "lucide-react";
import { z } from "zod";

import {
  Page,
  PageDescription,
  PageHeader,
  PageSection,
  PageSectionTitle,
} from "@/components/page-shell";
import { StreamsTimelineChart } from "@/components/streams-timeline-chart";
import { TimeRangeTabs } from "@/components/time-range-tabs";
import { TopArtistsRow } from "@/components/top-artists-row";
import { TrackRow } from "@/components/track-row";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMeQuery } from "@/lib/queries/me";
import { useFollow, useFollows, useUnfollow } from "@/lib/queries/social";
import {
  useUserByUsernameQuery,
  useUserExtendedStatsQuery,
  useUserStatsQuery,
} from "@/lib/queries/users";

const DEFAULT_RANGE = "30d";

const searchSchema = z.object({
  range: z.enum(["7d", "30d", "90d", "365d", "all"]).optional().catch(DEFAULT_RANGE),
});

export const Route = createFileRoute("/_authenticated/u/$username")({
  validateSearch: searchSchema,
  component: ProfilePage,
});

function ProfilePage() {
  const { username } = Route.useParams();
  const { range = DEFAULT_RANGE } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: me } = useMeQuery();
  const { data: user, isError, isLoading } = useUserByUsernameQuery(username);
  const { data: follows } = useFollows();
  const follow = useFollow();
  const unfollow = useUnfollow();

  const { data: lifetimeStats } = useUserExtendedStatsQuery(user?.id, "all");
  const { data: extended, isLoading: extendedLoading } = useUserExtendedStatsQuery(user?.id, range);
  const { data: stats, isLoading: statsLoading } = useUserStatsQuery(user?.id, range);

  if (isLoading) {
    return (
      <Page>
        <ProfileSkeleton />
      </Page>
    );
  }

  if (isError || !user) {
    return (
      <Page>
        <Card>
          <CardHeader>
            <CardTitle>Profile unavailable</CardTitle>
            <PageDescription>This profile is private, missing, or unavailable.</PageDescription>
          </CardHeader>
        </Card>
      </Page>
    );
  }

  const isOwnProfile = me?.id === user.id;
  const isFollowing = follows?.following.some((followed) => followed.id === user.id) ?? false;
  const pendingFollow = follow.isPending || unfollow.isPending;
  const joinedDate = dayjs(user.createdAt).format("MMMM YYYY");
  const totalScrobbles = lifetimeStats?.totalScrobbles ?? extended?.totalScrobbles;
  const listeningHours = extended ? Math.round(extended.totalListeningMs / 3_600_000) : 0;
  const peakHour = getPeak(extended?.scrobblesByHour);
  const peakDay = getPeak(extended?.scrobblesByDayOfWeek);
  const topGenres = extended?.topGenres ?? [];

  return (
    <Page className="gap-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar className="size-20">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
            <AvatarFallback className="text-xl">{getInitial(user.displayName)}</AvatarFallback>
          </Avatar>
          <PageHeader className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="truncate text-3xl font-bold">{user.displayName}</h1>
              {user.username ? (
                <Badge variant="outline" className="max-w-full">
                  @{user.username}
                </Badge>
              ) : null}
            </div>
            {user.bio ? (
              <PageDescription className="max-w-2xl text-pretty">{user.bio}</PageDescription>
            ) : null}
            <PageDescription>
              Member since {joinedDate}
              {typeof totalScrobbles === "number"
                ? ` · ${totalScrobbles.toLocaleString()} streams`
                : ""}
            </PageDescription>
          </PageHeader>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
          <TimeRangeTabs
            value={range}
            onChange={(nextRange) =>
              navigate({ search: (previous) => ({ ...previous, range: nextRange }) })
            }
          />
          {!isOwnProfile ? (
            <Button
              variant={isFollowing ? "outline" : "default"}
              disabled={pendingFollow}
              onClick={() => {
                if (isFollowing) {
                  unfollow.mutate(user.id);
                } else {
                  follow.mutate(user.id);
                }
              }}
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
      </div>

      {extendedLoading && !extended ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Card size="sm">
            <CardHeader>
              <CardDescription>Streams</CardDescription>
              <CardTitle className="text-2xl font-semibold">
                {(extended?.totalScrobbles ?? 0).toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardDescription>Listening time</CardDescription>
              <CardTitle className="text-2xl font-semibold">
                {listeningHours.toLocaleString()}h
              </CardTitle>
            </CardHeader>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardDescription>Mainstream score</CardDescription>
              <CardTitle className="text-2xl font-semibold">
                {extended?.mainstreamScore ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardDescription>Most active</CardDescription>
              <CardTitle className="text-2xl font-semibold">
                {peakHour ? formatHour(peakHour.key) : "No data"}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {statsLoading && !stats ? (
        <PageSection>
          <PageSectionTitle>Top artists</PageSectionTitle>
          <div>
            <HorizontalSkeleton />
          </div>
        </PageSection>
      ) : stats?.topArtists.length ? (
        <PageSection>
          <PageSectionTitle>Top artists</PageSectionTitle>
          <TopArtistsRow artists={stats.topArtists} />
        </PageSection>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <PageSection>
            <PageSectionTitle>Top tracks</PageSectionTitle>
            <div>
              {statsLoading && !stats ? (
                <ListSkeleton />
              ) : stats?.topTracks.length ? (
                <ol className="flex flex-col gap-2">
                  {stats.topTracks.map((item, index) => (
                    <li key={item.track.id}>
                      <TrackRow asChild>
                        <Link to="/tracks/$trackId" params={{ trackId: item.track.id }}>
                          <TrackRow.Leading>{index + 1}</TrackRow.Leading>
                          <TrackRow.Artwork>
                            {item.track.albumImageUrl ? (
                              <TrackRow.Image src={item.track.albumImageUrl} alt="" />
                            ) : null}
                          </TrackRow.Artwork>
                          <TrackRow.Content>
                            <TrackRow.Title>{item.track.name}</TrackRow.Title>
                            <TrackRow.Subtitle>
                              {item.playCount.toLocaleString()} plays
                            </TrackRow.Subtitle>
                          </TrackRow.Content>
                        </Link>
                      </TrackRow>
                    </li>
                  ))}
                </ol>
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>No top tracks</EmptyTitle>
                    <EmptyDescription>
                      This profile has no top tracks for the selected range yet.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
          </PageSection>

          {extended?.scrobblesByDate.length ? (
            <PageSection>
              <PageSectionTitle>Listening over time</PageSectionTitle>
              <div>
                <StreamsTimelineChart data={extended.scrobblesByDate} />
              </div>
            </PageSection>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <PageSection>
            <PageSectionTitle>Taste profile</PageSectionTitle>
            <div>
              <ItemGroup>
                <Item size="sm">
                  <ItemMedia variant="icon" className="rounded-full">
                    <Music2 />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{(extended?.totalScrobbles ?? 0).toLocaleString()}</ItemTitle>
                    <ItemDescription>Tracks played</ItemDescription>
                  </ItemContent>
                </Item>
                <Item size="sm">
                  <ItemMedia variant="icon" className="rounded-full">
                    <Clock3 />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{listeningHours.toLocaleString()}</ItemTitle>
                    <ItemDescription>Listening hours</ItemDescription>
                  </ItemContent>
                </Item>
                <Item size="sm">
                  <ItemMedia variant="icon" className="rounded-full">
                    <Radio />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{peakHour ? formatHour(peakHour.key) : "No data"}</ItemTitle>
                    <ItemDescription>Peak hour</ItemDescription>
                  </ItemContent>
                </Item>
                <Item size="sm">
                  <ItemMedia variant="icon" className="rounded-full">
                    <CalendarDays />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{peakDay ? DAY_NAMES[peakDay.key] : "No data"}</ItemTitle>
                    <ItemDescription>Peak day</ItemDescription>
                  </ItemContent>
                </Item>
              </ItemGroup>
            </div>
          </PageSection>

          <PageSection>
            <PageSectionTitle>Top genres</PageSectionTitle>
            <div>
              {topGenres.length ? (
                <GenreList genres={topGenres} />
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>No genre data</EmptyTitle>
                    <EmptyDescription>
                      This profile has no genre data for the selected range yet.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
          </PageSection>
        </div>
      </div>
    </Page>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-20 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
      </div>
      <StatsSkeleton />
      <ListSkeleton />
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <Card key={item} size="sm" aria-hidden="true">
          <CardHeader>
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-8 w-20" />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

function HorizontalSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden pb-2">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="flex w-28 shrink-0 flex-col items-center gap-2">
          <Skeleton className="size-20 rounded-full" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3, 4, 5].map((item) => (
        <Skeleton key={item} className="h-16 rounded-2xl" />
      ))}
    </div>
  );
}

function GenreList({ genres }: { genres: Array<{ genre: string; count: number }> }) {
  const maxCount = Math.max(...genres.map((genre) => genre.count), 1);

  return (
    <div className="flex flex-col gap-3">
      {genres.map((genre) => (
        <div key={genre.genre} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/library"
              search={{ tab: "artists", range: "all" }}
              className="min-w-0 truncate text-sm font-medium capitalize hover:text-primary"
            >
              {genre.genre}
            </Link>
            <span className="shrink-0 text-xs text-muted-foreground">
              {genre.count.toLocaleString()}
            </span>
          </div>
          <Progress value={(genre.count / maxCount) * 100} className="h-2" />
        </div>
      ))}
    </div>
  );
}

function getPeak(items?: Array<{ count: number; dow?: number; hour?: number }>) {
  if (!items?.length) return null;

  return items.reduce<{ key: number; count: number } | null>((peak, item) => {
    const key = item.hour ?? item.dow;
    if (key === undefined) return peak;

    const candidate = { key, count: item.count };
    if (!peak || candidate.count > peak.count) return candidate;
    return peak;
  }, null);
}

function formatHour(hour: number) {
  return dayjs().hour(hour).minute(0).format("h A");
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
