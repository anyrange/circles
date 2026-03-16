import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { TrackRow } from "@/components/TrackRow";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/artists/$artistId")({
  component: ArtistPage,
});

type ArtistPageData = {
  artist: {
    id: string;
    name: string;
    playCount: number;
    trackCount: number;
    albumCount: number;
    popularity?: number | null;
    genres?: string[] | null;
    images?: { url: string }[] | null;
  };
  topTracks: ArtistTopTrack[];
  albums: ArtistAlbum[];
  recentPlays: ArtistRecentPlay[];
  isHydrating?: boolean;
};

function ArtistPage() {
  const { artistId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["artists", artistId],
    queryFn: async () => {
      const res = await api.artists[":id"].$get({ param: { id: artistId } });
      if (!res.ok) throw new Error("Failed to fetch artist");
      return (await res.json()) as ArtistPageData;
    },
    refetchInterval: (query) => (query.state.data?.isHydrating ? 2000 : false),
  });

  if (isLoading) return <EntitySkeleton />;
  if (!data) return <div className="mx-auto max-w-5xl px-6 py-10">Artist not found.</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end">
        <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-[2rem] border border-border/60 bg-muted sm:size-36">
          {data.artist.images?.[0]?.url ? (
            <img src={data.artist.images[0].url} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-3xl font-medium text-muted-foreground">
              {data.artist.name[0]}
            </span>
          )}
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            Artist
          </p>
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
                <span
                  key={genre}
                  className="rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground capitalize"
                >
                  {genre}
                </span>
              ))}
            </div>
          ) : null}
          {data.isHydrating ? (
            <p className="text-sm text-muted-foreground">Refreshing artist profile...</p>
          ) : null}
        </div>
      </section>

      <div className="space-y-6">
        <div>
          <h2 className="mb-3 text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Most Played Tracks
          </h2>
          <ol className="space-y-2">
            {data.topTracks.map((item: ArtistTopTrack) => (
              <li key={item.track.id}>
                <TrackRow
                  title={item.track.name}
                  subtitle={
                    item.track.album ? (
                      <Link
                        to="/albums/$albumId"
                        params={{ albumId: item.track.album.id }}
                        className="hover:text-foreground"
                      >
                        {item.track.album.name}
                      </Link>
                    ) : null
                  }
                  imageUrl={item.track.album?.imageUrl}
                  to={`/tracks/${item.track.id}`}
                  trailing={`${item.playCount} plays`}
                />
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-[1.75rem] border border-border/60 bg-card/40 p-5">
          <h2 className="mb-4 text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Recent Plays
          </h2>
          <ol className="space-y-3">
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
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Albums
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.albums.map((item: ArtistAlbum) => (
              <Link
                key={item.album.id}
                to="/albums/$albumId"
                params={{ albumId: item.album.id }}
                className="rounded-[1.5rem] border border-border/60 bg-card/40 p-4 transition-colors hover:bg-card/70"
              >
                <div className="mb-3 aspect-square overflow-hidden rounded-2xl bg-muted">
                  {item.album.imageUrl ? (
                    <img src={item.album.imageUrl} alt="" className="size-full object-cover" />
                  ) : null}
                </div>
                <p className="truncate font-medium">{item.album.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.playCount} plays
                  {item.album.releaseDate ? ` • ${item.album.releaseDate}` : ""}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type ArtistTopTrack = {
  track: {
    id: string;
    name: string;
    album?: { id: string; name: string; imageUrl?: string | null } | null;
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
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <div className="flex items-end gap-5">
        <Skeleton className="size-28 rounded-3xl" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-[1.75rem]" />
    </div>
  );
}
