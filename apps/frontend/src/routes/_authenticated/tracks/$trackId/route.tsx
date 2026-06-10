import { Link, createFileRoute } from "@tanstack/react-router";
import type { ComponentPropsWithoutRef } from "react";

import { Page } from "@/components/page-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Item, ItemContent, ItemGroup, ItemTitle } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrackQuery } from "@/lib/queries/tracks";

export const Route = createFileRoute("/_authenticated/tracks/$trackId")({
  component: TrackPage,
});

function TrackPage() {
  const { trackId } = Route.useParams();
  const { data, isLoading } = useTrackQuery(trackId);

  if (isLoading) return <EntitySkeleton />;
  if (!data) return <Page>Track not found.</Page>;

  return (
    <Page className="gap-10">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end">
        <div className="size-40 shrink-0 overflow-hidden rounded-2xl bg-muted lg:size-48">
          {data.track.album?.imageUrl ? (
            <img src={data.track.album.imageUrl} alt="" className="size-full object-cover" />
          ) : null}
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Track</p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance lg:text-5xl">
            {data.track.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>By</span>
            {data.artists.map((item: TrackArtist) => (
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

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-10">
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Audio features</h2>
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
              <Metric>
                <Metric.Label>Danceability</Metric.Label>
                <Metric.Value>
                  {formatAudioFeature(data.track.audioFeatures?.danceability)}
                </Metric.Value>
              </Metric>
              <Metric>
                <Metric.Label>Energy</Metric.Label>
                <Metric.Value>{formatAudioFeature(data.track.audioFeatures?.energy)}</Metric.Value>
              </Metric>
              <Metric>
                <Metric.Label>Valence</Metric.Label>
                <Metric.Value>{formatAudioFeature(data.track.audioFeatures?.valence)}</Metric.Value>
              </Metric>
              <Metric>
                <Metric.Label>Acousticness</Metric.Label>
                <Metric.Value>
                  {formatAudioFeature(data.track.audioFeatures?.acousticness)}
                </Metric.Value>
              </Metric>
              <Metric>
                <Metric.Label>Instrumentalness</Metric.Label>
                <Metric.Value>
                  {formatAudioFeature(data.track.audioFeatures?.instrumentalness)}
                </Metric.Value>
              </Metric>
              <Metric>
                <Metric.Label>Speechiness</Metric.Label>
                <Metric.Value>
                  {formatAudioFeature(data.track.audioFeatures?.speechiness)}
                </Metric.Value>
              </Metric>
              <Metric>
                <Metric.Label>Liveness</Metric.Label>
                <Metric.Value>
                  {formatAudioFeature(data.track.audioFeatures?.liveness)}
                </Metric.Value>
              </Metric>
              <Metric>
                <Metric.Label>Tempo</Metric.Label>
                <Metric.Value>{formatTempo(data.track.audioFeatures?.tempo)}</Metric.Value>
              </Metric>
            </dl>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Playback window</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <dt className="text-sm text-muted-foreground">First play</dt>
                <dd className="text-sm">
                  {data.track.firstPlayedAt
                    ? new Date(data.track.firstPlayedAt).toLocaleString()
                    : "Never"}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-sm text-muted-foreground">Latest play</dt>
                <dd className="text-sm">
                  {data.track.lastPlayedAt
                    ? new Date(data.track.lastPlayedAt).toLocaleString()
                    : "Never"}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="flex min-w-0 flex-col gap-4">
          <h2 className="text-xl font-semibold">Recent plays</h2>
          <ItemGroup>
            {data.recentPlays.map((play: { playedAt: string }) => (
              <Item key={play.playedAt} size="sm">
                <ItemContent>
                  <ItemTitle>{new Date(play.playedAt).toLocaleString()}</ItemTitle>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </section>
      </div>
    </Page>
  );
}

type TrackArtist = {
  artist: { id: string; name: string; images?: { url: string }[] | null };
};

function MetricRoot(props: ComponentPropsWithoutRef<"div">) {
  return <div className="flex flex-col gap-1" {...props} />;
}

function MetricLabel(props: ComponentPropsWithoutRef<"dt">) {
  return <dt className="text-sm text-muted-foreground" {...props} />;
}

function MetricValue(props: ComponentPropsWithoutRef<"dd">) {
  return <dd className="text-xl font-semibold" {...props} />;
}

const Metric = Object.assign(MetricRoot, {
  Label: MetricLabel,
  Value: MetricValue,
});

function EntitySkeleton() {
  return (
    <Page>
      <div className="flex items-end gap-5">
        <Skeleton className="size-32 rounded-2xl" />
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

function formatDuration(durationMs: number) {
  return `${Math.floor(durationMs / 60000)}:${String(Math.floor((durationMs % 60000) / 1000)).padStart(2, "0")}`;
}

function formatAudioFeature(value: number | null | undefined) {
  return value === null || value === undefined ? "N/A" : Math.round(value * 100);
}

function formatTempo(value: number | null | undefined) {
  return value === null || value === undefined ? "N/A" : `${Math.round(value)} BPM`;
}
