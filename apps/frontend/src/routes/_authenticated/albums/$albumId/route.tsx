import { Link, createFileRoute } from "@tanstack/react-router";

import { Page, PageSection, PageSectionTitle } from "@/components/page-shell";
import { TrackRow } from "@/components/track-row";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlbumQuery } from "@/lib/queries/albums";

export const Route = createFileRoute("/_authenticated/albums/$albumId")({
  component: AlbumPage,
});

function AlbumPage() {
  const { albumId } = Route.useParams();
  const { data, isLoading } = useAlbumQuery(albumId);

  if (isLoading) return <EntitySkeleton />;
  if (!data) return <Page>Album not found.</Page>;

  return (
    <Page>
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end">
        <div className="size-36 shrink-0 overflow-hidden rounded-2xl bg-muted">
          {data.album.images?.[0]?.url ? (
            <img src={data.album.images[0].url} alt="" className="size-full object-cover" />
          ) : null}
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{data.album.albumType ?? "Album"}</p>
          <h1 className="text-4xl font-semibold tracking-tight">{data.album.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>By</span>
            {data.artists.map((item: AlbumArtist) => (
              <Link
                key={item.artist.id}
                to="/artists/$artistId"
                params={{ artistId: item.artist.id }}
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
      </section>

      <div className="flex flex-col gap-6">
        <PageSection>
          <PageSectionTitle>Tracklist</PageSectionTitle>
          <ol className="flex flex-col gap-2">
            {data.tracks.map((item: AlbumTrack, index: number) => (
              <li key={item.track.id}>
                <TrackRow compact asChild>
                  <Link to="/tracks/$trackId" params={{ trackId: item.track.id }}>
                    <TrackRow.Leading>{index + 1}</TrackRow.Leading>
                    <TrackRow.Artwork />
                    <TrackRow.Content>
                      <TrackRow.Title>{item.track.name}</TrackRow.Title>
                    </TrackRow.Content>
                    <TrackRow.Trailing>{item.playCount} plays</TrackRow.Trailing>
                  </Link>
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
              {data.recentPlays.map((play: AlbumRecentPlay) => (
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
