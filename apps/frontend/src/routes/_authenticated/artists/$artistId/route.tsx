import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Disc3, Music2, UserRound } from "lucide-react";
import { z } from "zod";

import { ListeningByYearChart } from "@/components/listening-by-year-chart";
import { Page, PageSection, PageSectionTitle } from "@/components/page-shell";
import { TimeRangeSelect } from "@/components/time-range-select";
import { TrackRow } from "@/components/track-row";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useArtistQuery } from "@/lib/queries/artists";

export const Route = createFileRoute("/_authenticated/artists/$artistId")({
  validateSearch: z.object({
    range: z.enum(["7d", "30d", "90d", "365d", "all"]).optional().catch("all"),
  }),
  component: ArtistPage,
});

function ArtistPage() {
  const { artistId } = Route.useParams();
  const { range = "all" } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data, isLoading } = useArtistQuery(artistId, range);

  if (isLoading) return <EntitySkeleton />;
  if (!data) return <Page>Artist not found.</Page>;

  return (
    <Page className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end">
        <div className="flex size-36 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
          {data.artist.images?.[0]?.url ? (
            <img src={data.artist.images[0].url} alt="" className="size-full object-cover" />
          ) : (
            <UserRound className="size-12 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-balance lg:text-4xl">
            {data.artist.name}
          </h1>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>{data.artist.playCount.toLocaleString()} plays</span>
            <span>•</span>
            <span>{data.artist.trackCount.toLocaleString()} tracks</span>
            <span>•</span>
            <span>{data.artist.albumCount.toLocaleString()} albums</span>
            {data.artist.popularity ? (
              <>
                <span>•</span>
                <span>{data.artist.popularity}/100 popularity</span>
              </>
            ) : null}
          </div>
          {data.artist.genres?.length ? (
            <div className="flex flex-wrap gap-2">
              {data.artist.genres.slice(0, 8).map((genre: string) => (
                <Badge key={genre} variant="outline" className="capitalize">
                  {genre}
                </Badge>
              ))}
            </div>
          ) : null}
          {data.isHydrating ? (
            <p className="text-sm text-muted-foreground">Refreshing artist profile...</p>
          ) : null}
        </div>
        <div className="sm:ml-auto">
          <TimeRangeSelect
            value={range}
            onChange={(nextRange) => navigate({ search: { range: nextRange }, resetScroll: false })}
          />
        </div>
      </section>

      <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <PageSection>
            <PageSectionTitle>Most played tracks</PageSectionTitle>
            <ol className="grid gap-x-6 md:grid-cols-2">
              {data.topTracks.map((item: ArtistTopTrack) => (
                <li key={item.track.id}>
                  <TrackRow.Compact className="px-0 hover:bg-transparent">
                    <TrackRow.Artwork>
                      {item.track.album?.imageUrl ? (
                        <TrackRow.Image src={item.track.album.imageUrl} alt="" />
                      ) : null}
                    </TrackRow.Artwork>
                    <TrackRow.Content>
                      <TrackRow.Title>
                        <Link
                          to="/tracks/$trackId"
                          params={{ trackId: item.track.id }}
                          search={{ range }}
                          className="hover:text-muted-foreground"
                        >
                          {item.track.name}
                        </Link>
                      </TrackRow.Title>
                      {item.track.album ? (
                        <TrackRow.Subtitle>
                          <Link
                            to="/albums/$albumId"
                            params={{ albumId: item.track.album.id }}
                            search={{ range }}
                            className="hover:text-foreground"
                          >
                            {item.track.album.name}
                          </Link>
                        </TrackRow.Subtitle>
                      ) : null}
                    </TrackRow.Content>
                    <TrackRow.Trailing>{item.playCount} plays</TrackRow.Trailing>
                  </TrackRow.Compact>
                </li>
              ))}
            </ol>
          </PageSection>

          <PageSection>
            <PageSectionTitle>Albums</PageSectionTitle>
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
              {data.albums.map((item: ArtistAlbum) => (
                <Link
                  key={item.album.id}
                  to="/albums/$albumId"
                  params={{ albumId: item.album.id }}
                  search={{ range }}
                  className="group min-w-0"
                >
                  <div className="mb-2 flex aspect-square items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground">
                    {item.album.imageUrl ? (
                      <img
                        src={item.album.imageUrl}
                        alt=""
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <Disc3 />
                    )}
                  </div>
                  <p className="truncate text-sm font-medium">{item.album.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.playCount} plays
                    {item.album.releaseDate ? ` · ${item.album.releaseDate.slice(0, 4)}` : ""}
                  </p>
                </Link>
              ))}
            </div>
          </PageSection>
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <section className="flex min-w-0 flex-col gap-3">
            <h2 className="text-base font-semibold">Listening by year</h2>
            {data.scrobblesByYear.length ? (
              <ListeningByYearChart data={data.scrobblesByYear} />
            ) : (
              <p className="text-sm text-muted-foreground">No plays in this range.</p>
            )}
          </section>
          <section className="flex min-w-0 flex-col gap-3">
            <h2 className="text-base font-semibold">Recent plays</h2>
            <div className="flex flex-col">
              {data.recentPlays.map((play: ArtistRecentPlay) => (
                <TrackRow.Compact key={`${play.track.id}-${play.playedAt}`} asChild>
                  <Link
                    to="/tracks/$trackId"
                    params={{ trackId: play.track.id }}
                    search={{ range }}
                  >
                    <TrackRow.Artwork>
                      {play.track.albumImageUrl ? (
                        <img src={play.track.albumImageUrl} alt="" />
                      ) : (
                        <Music2 />
                      )}
                    </TrackRow.Artwork>
                    <TrackRow.Content>
                      <TrackRow.Title>{play.track.name}</TrackRow.Title>
                      <TrackRow.Subtitle>
                        {new Date(play.playedAt).toLocaleString()}
                      </TrackRow.Subtitle>
                    </TrackRow.Content>
                  </Link>
                </TrackRow.Compact>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </Page>
  );
}

type ArtistTopTrack = {
  track: {
    id: string;
    name: string;
    album?: { id: string; name: string | null; imageUrl?: string | null } | null;
  };
  playCount: number;
};

type ArtistAlbum = {
  album: { id: string; name: string; imageUrl?: string | null; releaseDate?: string | null };
  playCount: number;
};

type ArtistRecentPlay = {
  playedAt: string;
  track: { id: string; name: string; albumImageUrl?: string | null };
};

function EntitySkeleton() {
  return (
    <Page>
      <div className="flex items-end gap-5">
        <Skeleton className="size-28 rounded-3xl" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-64 w-full" />
    </Page>
  );
}
