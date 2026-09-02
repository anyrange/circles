import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Disc3, Music2 } from "lucide-react";
import { z } from "zod";

import { ListeningByYearChart } from "@/components/listening-by-year-chart";
import { Page, PageSection, PageSectionTitle } from "@/components/page-shell";
import { TimeRangeSelect } from "@/components/time-range-select";
import { TrackRow } from "@/components/track-row";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlbumQuery } from "@/lib/queries/albums";

export const Route = createFileRoute("/_authenticated/albums/$albumId")({
  validateSearch: z.object({
    range: z.enum(["7d", "30d", "90d", "365d", "all"]).optional().catch("all"),
  }),
  component: AlbumPage,
});

function AlbumPage() {
  const { albumId } = Route.useParams();
  const { range = "all" } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data, isLoading } = useAlbumQuery(albumId, range);

  if (isLoading) return <EntitySkeleton />;
  if (!data) return <Page>Album not found.</Page>;

  const albumImageUrl = data.album.images?.[0]?.url;

  return (
    <Page className="mx-auto max-w-6xl">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end">
        <div className="flex size-36 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
          {albumImageUrl ? (
            <img src={albumImageUrl} alt="" className="size-full object-cover" />
          ) : (
            <Disc3 className="size-12" />
          )}
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-balance lg:text-4xl">
            {data.album.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>By</span>
            {data.artists.map((item: AlbumArtist) => (
              <Link
                key={item.artist.id}
                to="/artists/$artistId"
                params={{ artistId: item.artist.id }}
                search={{ range }}
                className="inline-flex items-center gap-2 hover:text-foreground"
              >
                <Avatar size="sm">
                  <AvatarImage src={item.artist.images?.[0]?.url} />
                  <AvatarFallback>{item.artist.name[0]}</AvatarFallback>
                </Avatar>
                {item.artist.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>{data.album.playCount.toLocaleString()} plays</span>
            <span>•</span>
            <span>{data.album.trackCount.toLocaleString()} tracks</span>
            {data.album.releaseDate ? (
              <>
                <span>•</span>
                <span>{data.album.releaseDate}</span>
              </>
            ) : null}
          </div>
        </div>
        <div className="sm:ml-auto">
          <TimeRangeSelect
            value={range}
            onChange={(nextRange) => navigate({ search: { range: nextRange }, resetScroll: false })}
          />
        </div>
      </section>

      <div className="grid items-start gap-12 xl:grid-cols-[minmax(0,44rem)_18rem] xl:justify-between">
        <PageSection className="max-w-3xl">
          <PageSectionTitle>Tracklist</PageSectionTitle>
          <ol className="flex flex-col">
            {data.tracks.map((item: AlbumTrack, index: number) => (
              <li key={item.track.id}>
                <Link
                  to="/tracks/$trackId"
                  params={{ trackId: item.track.id }}
                  search={{ range }}
                  className="grid min-h-11 grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-md px-2 text-sm transition-colors hover:bg-muted/50"
                >
                  <span className="text-right text-xs text-muted-foreground tabular-nums">
                    {index + 1}
                  </span>
                  <span className="truncate font-medium">{item.track.name}</span>
                  <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                    {item.playCount} plays
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </PageSection>

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
              {data.recentPlays.map((play: AlbumRecentPlay) => (
                <TrackRow.Compact key={`${play.track.id}-${play.playedAt}`} asChild>
                  <Link
                    to="/tracks/$trackId"
                    params={{ trackId: play.track.id }}
                    search={{ range }}
                  >
                    <TrackRow.Artwork>
                      {albumImageUrl ? <TrackRow.Image src={albumImageUrl} alt="" /> : <Music2 />}
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

type AlbumArtist = {
  artist: { id: string; name: string; images?: { url: string }[] | null };
};

type AlbumTrack = {
  track: { id: string; name: string };
  playCount: number;
};

type AlbumRecentPlay = {
  playedAt: string;
  track: { id: string; name: string };
};

function EntitySkeleton() {
  return (
    <Page>
      <div className="flex items-end gap-5">
        <Skeleton className="size-36 rounded-2xl" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
      <Skeleton className="h-64 w-full" />
    </Page>
  );
}
