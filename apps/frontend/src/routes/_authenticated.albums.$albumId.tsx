import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { TrackRow } from "@/components/TrackRow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/albums/$albumId")({
  component: AlbumPage,
});

type AlbumPageData = {
  album: {
    id: string;
    name: string;
    albumType?: string | null;
    playCount: number;
    trackCount: number;
    releaseDate?: string | null;
    images?: { url: string }[] | null;
  };
  artists: AlbumArtist[];
  tracks: AlbumTrack[];
  recentPlays: AlbumRecentPlay[];
};

function AlbumPage() {
  const { albumId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["albums", albumId],
    queryFn: async () => {
      const res = await api.albums[":id"].$get({ param: { id: albumId } });
      if (!res.ok) throw new Error("Failed to fetch album");
      return (await res.json()) as AlbumPageData;
    },
  });

  if (isLoading) return <EntitySkeleton />;
  if (!data) return <div className="mx-auto max-w-5xl px-6 py-10">Album not found.</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end">
        <div className="size-36 shrink-0 overflow-hidden rounded-[2rem] border border-border/60 bg-muted">
          {data.album.images?.[0]?.url ? (
            <img src={data.album.images[0].url} alt="" className="size-full object-cover" />
          ) : null}
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            {data.album.albumType ?? "Album"}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">{data.album.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {data.artists.map((item: AlbumArtist) => (
              <Link
                key={item.artist.id}
                to="/artists/$artistId"
                params={{ artistId: item.artist.id }}
                className="inline-flex items-center gap-2 rounded-full bg-card/50 px-2.5 py-1 hover:text-foreground"
              >
                <Avatar className="size-5">
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

      <div className="space-y-6">
        <div>
          <h2 className="mb-3 text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Tracklist
          </h2>
          <ol className="space-y-2">
            {data.tracks.map((item: AlbumTrack, index: number) => (
              <li key={item.track.id}>
                <TrackRow
                  compact
                  title={item.track.name}
                  leading={index + 1}
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
        </div>
      </div>
    </div>
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
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <div className="flex items-end gap-5">
        <Skeleton className="size-36 rounded-[2rem]" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-[1.75rem]" />
    </div>
  );
}
