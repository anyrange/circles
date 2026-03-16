import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/tracks/$trackId")({
  component: TrackPage,
});

type TrackPageData = {
  track: {
    id: string;
    name: string;
    playCount: number;
    durationMs?: number | null;
    popularity?: number | null;
    explicit?: boolean | null;
    firstPlayedAt?: string | null;
    lastPlayedAt?: string | null;
    album?: {
      id: string;
      name: string;
      releaseDate?: string | null;
      imageUrl?: string | null;
    } | null;
    audioFeatures?: {
      danceability?: number | null;
      energy?: number | null;
      valence?: number | null;
      acousticness?: number | null;
      instrumentalness?: number | null;
      speechiness?: number | null;
      liveness?: number | null;
      tempo?: number | null;
    } | null;
  };
  artists: TrackArtist[];
  recentPlays: { playedAt: string }[];
};

function TrackPage() {
  const { trackId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["tracks", trackId],
    queryFn: async () => {
      const res = await api.tracks[":id"].$get({ param: { id: trackId } });
      if (!res.ok) throw new Error("Failed to fetch track");
      return (await res.json()) as TrackPageData;
    },
  });

  if (isLoading) return <EntitySkeleton />;
  if (!data) return <div className="mx-auto max-w-5xl px-6 py-10">Track not found.</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end">
        <div className="size-32 shrink-0 overflow-hidden rounded-[2rem] border border-border/60 bg-muted">
          {data.track.album?.imageUrl ? (
            <img src={data.track.album.imageUrl} alt="" className="size-full object-cover" />
          ) : null}
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            Track
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">{data.track.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {data.artists.map((item: TrackArtist) => (
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
            <span>{data.track.playCount.toLocaleString()} plays</span>
            {data.track.durationMs ? (
              <>
                <span>•</span>
                <span>{formatDuration(data.track.durationMs)}</span>
              </>
            ) : null}
            {data.track.popularity ? (
              <>
                <span>•</span>
                <span>{data.track.popularity}/100 popularity</span>
              </>
            ) : null}
            {data.track.explicit ? (
              <>
                <span>•</span>
                <span>Explicit</span>
              </>
            ) : null}
          </div>
          {data.track.album?.id ? (
            <Link
              to="/albums/$albumId"
              params={{ albumId: data.track.album.id }}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <span>On</span>
              <span className="font-medium text-foreground">{data.track.album.name}</span>
              {data.track.album.releaseDate ? <span>• {data.track.album.releaseDate}</span> : null}
            </Link>
          ) : null}
        </div>
      </section>

      <div className="space-y-6">
        <div className="rounded-[1.75rem] border border-border/60 bg-card/40 p-5">
          <h2 className="mb-4 text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Audio Features
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Danceability" value={data.track.audioFeatures?.danceability} />
            <Metric label="Energy" value={data.track.audioFeatures?.energy} />
            <Metric label="Valence" value={data.track.audioFeatures?.valence} />
            <Metric label="Acousticness" value={data.track.audioFeatures?.acousticness} />
            <Metric label="Instrumentalness" value={data.track.audioFeatures?.instrumentalness} />
            <Metric label="Speechiness" value={data.track.audioFeatures?.speechiness} />
            <Metric label="Liveness" value={data.track.audioFeatures?.liveness} />
            <Metric label="Tempo" value={data.track.audioFeatures?.tempo} suffix=" BPM" />
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-border/60 bg-card/40 p-5">
          <h2 className="mb-4 text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Playback Window
          </h2>
          <p className="text-sm">
            {data.track.firstPlayedAt
              ? new Date(data.track.firstPlayedAt).toLocaleString()
              : "Never"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">First play</p>
          <p className="mt-4 text-sm">
            {data.track.lastPlayedAt ? new Date(data.track.lastPlayedAt).toLocaleString() : "Never"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Latest play</p>
        </div>

        <div className="rounded-[1.75rem] border border-border/60 bg-card/40 p-5">
          <h2 className="mb-4 text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Recent Plays
          </h2>
          <ol className="space-y-3">
            {data.recentPlays.map((play: { playedAt: string }) => (
              <li key={play.playedAt} className="rounded-xl px-3 py-2 hover:bg-muted/50">
                <p className="text-sm font-medium">{new Date(play.playedAt).toLocaleString()}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

type TrackArtist = {
  artist: { id: string; name: string; images?: { url: string }[] | null };
};

function Metric({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: number | null | undefined;
  suffix?: string;
}) {
  const content =
    value === null || value === undefined
      ? "N/A"
      : label === "Tempo"
        ? `${Math.round(value)}${suffix}`
        : `${Math.round(value * 100)}${suffix}`;

  return (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
      <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{content}</p>
    </div>
  );
}

function EntitySkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <div className="flex items-end gap-5">
        <Skeleton className="size-32 rounded-[2rem]" />
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

function formatDuration(durationMs: number) {
  return `${Math.floor(durationMs / 60000)}:${String(Math.floor((durationMs % 60000) / 1000)).padStart(2, "0")}`;
}
