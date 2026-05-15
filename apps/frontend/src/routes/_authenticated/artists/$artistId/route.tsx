import { Link, createFileRoute } from "@tanstack/react-router";

import { Page, PageSection, PageSectionTitle } from "@/components/page-shell";
import { TrackRow } from "@/components/track-row";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useArtistQuery } from "@/lib/queries/artists";

export const Route = createFileRoute("/_authenticated/artists/$artistId")({
  component: ArtistPage,
});

function ArtistPage() {
  const { artistId } = Route.useParams();
  const { data, isLoading } = useArtistQuery(artistId);

  if (isLoading) return <EntitySkeleton />;
  if (!data) return <Page>Artist not found.</Page>;

  return (
    <Page>
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end">
        <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted sm:size-36">
          {data.artist.images?.[0]?.url ? (
            <img src={data.artist.images[0].url} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-3xl font-medium text-muted-foreground">
              {data.artist.name[0]}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Artist</p>
          <h1 className="text-4xl font-semibold tracking-tight">{data.artist.name}</h1>
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
      </section>

      <div className="flex flex-col gap-6">
        <PageSection>
          <PageSectionTitle>Most played tracks</PageSectionTitle>
          <ol className="flex flex-col gap-2">
            {data.topTracks.map((item: ArtistTopTrack) => (
              <li key={item.track.id}>
                <TrackRow>
                  <TrackRow.Artwork imageUrl={item.track.album?.imageUrl} />
                  <TrackRow.Content>
                    <TrackRow.Title>
                      <Link
                        to="/tracks/$trackId"
                        params={{ trackId: item.track.id }}
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

        <Card>
          <CardHeader>
            <CardTitle>Recent plays</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-3">
              {data.recentPlays.map((play: ArtistRecentPlay) => (
                <li key={`${play.track.id}-${play.playedAt}`}>
                  <Link
                    to="/tracks/$trackId"
                    params={{ trackId: play.track.id }}
                    className="block rounded-xl px-3 py-2 transition-colors hover:bg-muted/50"
                  >
                    <p className="truncate text-sm font-medium">{play.track.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(play.playedAt).toLocaleString()}
                    </p>
                  </Link>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <PageSection>
          <PageSectionTitle>Albums</PageSectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.albums.map((item: ArtistAlbum) => (
              <Link
                key={item.album.id}
                to="/albums/$albumId"
                params={{ albumId: item.album.id }}
                className="block"
              >
                <Card size="sm" className="h-full">
                  <CardContent>
                    <div className="aspect-square overflow-hidden rounded-xl bg-muted">
                      {item.album.imageUrl ? (
                        <img src={item.album.imageUrl} alt="" className="size-full object-cover" />
                      ) : null}
                    </div>
                  </CardContent>
                  <CardHeader>
                    <CardTitle className="truncate">{item.album.name}</CardTitle>
                    <CardDescription>
                      {item.playCount} plays
                      {item.album.releaseDate ? ` • ${item.album.releaseDate}` : ""}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </PageSection>
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
  track: { id: string; name: string };
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
