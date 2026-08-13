import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Disc3, Music2, UserRound } from "lucide-react";
import { z } from "zod";

import { ListeningByYearChart } from "@/components/listening-by-year-chart";
import { Page, PageSection, PageSectionTitle } from "@/components/page-shell";
import { TimeRangeSelect } from "@/components/time-range-select";
import { TrackRow } from "@/components/track-row";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
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
    <Page className="gap-10">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end">
        <div className="flex size-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted lg:size-48">
          {data.artist.images?.[0]?.url ? (
            <img src={data.artist.images[0].url} alt="" className="size-full object-cover" />
          ) : (
            <UserRound className="size-16 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Artist</p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance lg:text-5xl">
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
        <div className="lg:ml-auto">
          <TimeRangeSelect
            value={range}
            onChange={(nextRange) => navigate({ search: { range: nextRange }, resetScroll: false })}
          />
        </div>
      </section>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-10">
          <PageSection>
            <PageSectionTitle>Most played tracks</PageSectionTitle>
            <ol className="flex flex-col gap-2">
              {data.topTracks.map((item: ArtistTopTrack) => (
                <li key={item.track.id}>
                  <TrackRow>
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
                  </TrackRow>
                </li>
              ))}
            </ol>
          </PageSection>

          <PageSection>
            <PageSectionTitle>Albums</PageSectionTitle>
            <ItemGroup>
              {data.albums.map((item: ArtistAlbum) => (
                <Item key={item.album.id} asChild size="sm">
                  <Link
                    to="/albums/$albumId"
                    params={{ albumId: item.album.id }}
                    search={{ range }}
                  >
                    <ItemMedia variant={item.album.imageUrl ? "image" : "icon"}>
                      {item.album.imageUrl ? <img src={item.album.imageUrl} alt="" /> : <Disc3 />}
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{item.album.name}</ItemTitle>
                      <ItemDescription>
                        {item.playCount} plays
                        {item.album.releaseDate ? ` • ${item.album.releaseDate}` : ""}
                      </ItemDescription>
                    </ItemContent>
                  </Link>
                </Item>
              ))}
            </ItemGroup>
          </PageSection>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Listening by year</CardTitle>
            </CardHeader>
            <CardContent>
              {data.scrobblesByYear.length ? (
                <ListeningByYearChart data={data.scrobblesByYear} />
              ) : (
                <p className="py-8 text-sm text-muted-foreground">No plays in this range.</p>
              )}
            </CardContent>
          </Card>
          <section className="flex min-w-0 flex-col gap-3">
            <h2 className="text-base font-semibold">Recent plays</h2>
            <ItemGroup>
              {data.recentPlays.map((play: ArtistRecentPlay) => (
                <Item key={`${play.track.id}-${play.playedAt}`} asChild size="sm">
                  <Link
                    to="/tracks/$trackId"
                    params={{ trackId: play.track.id }}
                    search={{ range }}
                  >
                    <ItemMedia variant={play.track.albumImageUrl ? "image" : "icon"}>
                      {play.track.albumImageUrl ? (
                        <img src={play.track.albumImageUrl} alt="" />
                      ) : (
                        <Music2 />
                      )}
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{play.track.name}</ItemTitle>
                      <ItemDescription>{new Date(play.playedAt).toLocaleString()}</ItemDescription>
                    </ItemContent>
                  </Link>
                </Item>
              ))}
            </ItemGroup>
          </section>
        </div>
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
