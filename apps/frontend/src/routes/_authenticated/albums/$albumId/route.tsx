import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Disc3, Music2 } from "lucide-react";
import { z } from "zod";

import { ListeningByYearChart } from "@/components/listening-by-year-chart";
import { Page, PageSection, PageSectionTitle } from "@/components/page-shell";
import { TimeRangeSelect } from "@/components/time-range-select";
import { TrackRow } from "@/components/track-row";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    <Page className="gap-10">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end">
        <div className="flex size-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted text-muted-foreground lg:size-48">
          {albumImageUrl ? (
            <img src={albumImageUrl} alt="" className="size-full object-cover" />
          ) : (
            <Disc3 className="size-16" />
          )}
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{data.album.albumType ?? "Album"}</p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance lg:text-5xl">
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
        <div className="lg:ml-auto">
          <TimeRangeSelect
            value={range}
            onChange={(nextRange) => navigate({ search: { range: nextRange }, resetScroll: false })}
          />
        </div>
      </section>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <PageSection>
          <PageSectionTitle>Tracklist</PageSectionTitle>
          <ol className="flex flex-col gap-2">
            {data.tracks.map((item: AlbumTrack, index: number) => (
              <li key={item.track.id}>
                <TrackRow.Compact asChild>
                  <Link
                    to="/tracks/$trackId"
                    params={{ trackId: item.track.id }}
                    search={{ range }}
                  >
                    <TrackRow.Leading>{index + 1}</TrackRow.Leading>
                    <TrackRow.Artwork>
                      {albumImageUrl ? <TrackRow.Image src={albumImageUrl} alt="" /> : null}
                    </TrackRow.Artwork>
                    <TrackRow.Content>
                      <TrackRow.Title>{item.track.name}</TrackRow.Title>
                    </TrackRow.Content>
                    <TrackRow.Trailing>{item.playCount} plays</TrackRow.Trailing>
                  </Link>
                </TrackRow.Compact>
              </li>
            ))}
          </ol>
        </PageSection>

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
              {data.recentPlays.map((play: AlbumRecentPlay) => (
                <Item key={`${play.track.id}-${play.playedAt}`} asChild size="sm">
                  <Link
                    to="/tracks/$trackId"
                    params={{ trackId: play.track.id }}
                    search={{ range }}
                  >
                    <ItemMedia variant={albumImageUrl ? "image" : "icon"}>
                      {albumImageUrl ? <img src={albumImageUrl} alt="" /> : <Music2 />}
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
