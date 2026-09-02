import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Music2 } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { z } from "zod";

import { ListeningByYearChart } from "@/components/listening-by-year-chart";
import { Page, PageSection, PageSectionTitle } from "@/components/page-shell";
import { TimeRangeSelect } from "@/components/time-range-select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrackQuery } from "@/lib/queries/tracks";

export const Route = createFileRoute("/_authenticated/tracks/$trackId")({
  validateSearch: z.object({
    range: z.enum(["7d", "30d", "90d", "365d", "all"]).optional().catch("all"),
  }),
  component: TrackPage,
});

function TrackPage() {
  const { trackId } = Route.useParams();
  const { range = "all" } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data, isLoading } = useTrackQuery(trackId, range);

  if (isLoading) return <EntitySkeleton />;
  if (!data) return <Page>Track not found.</Page>;

  const albumImageUrl = data.track.album?.imageUrl;
  const hasAudioFeatures = Object.values(data.track.audioFeatures ?? {}).some(
    (value) => value !== null && value !== undefined,
  );

  return (
    <Page className="mx-auto max-w-6xl">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end">
        <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
          {albumImageUrl ? (
            <img src={albumImageUrl} alt="" className="size-full object-cover" />
          ) : (
            <Music2 className="size-10" />
          )}
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-balance lg:text-4xl">
            {data.track.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>By</span>
            {data.artists.map((item: TrackArtist) => (
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
              search={{ range }}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <span>On</span>
              <span className="font-medium text-foreground">{data.track.album.name}</span>
              {data.track.album.releaseDate ? <span>• {data.track.album.releaseDate}</span> : null}
            </Link>
          ) : null}
        </div>
        <div className="sm:ml-auto">
          <TimeRangeSelect
            value={range}
            onChange={(nextRange) => navigate({ search: { range: nextRange }, resetScroll: false })}
          />
        </div>
      </section>

      <div className="grid items-start gap-12 xl:grid-cols-[minmax(0,44rem)_18rem] xl:justify-between">
        <div className="flex min-w-0 flex-col gap-8">
          {hasAudioFeatures ? (
            <PageSection>
              <PageSectionTitle>Audio features</PageSectionTitle>
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                <Metric>
                  <Metric.Label>Danceability</Metric.Label>
                  <Metric.Value>
                    {formatAudioFeature(data.track.audioFeatures?.danceability)}
                  </Metric.Value>
                </Metric>
                <Metric>
                  <Metric.Label>Energy</Metric.Label>
                  <Metric.Value>
                    {formatAudioFeature(data.track.audioFeatures?.energy)}
                  </Metric.Value>
                </Metric>
                <Metric>
                  <Metric.Label>Valence</Metric.Label>
                  <Metric.Value>
                    {formatAudioFeature(data.track.audioFeatures?.valence)}
                  </Metric.Value>
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
            </PageSection>
          ) : null}

          <PageSection>
            <PageSectionTitle>Playback window</PageSectionTitle>
            <dl className="grid gap-6 sm:grid-cols-2">
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
            <ol className="flex flex-col">
              {data.recentPlays.map((play: { playedAt: string }) => (
                <li
                  key={play.playedAt}
                  className="flex items-center justify-between gap-4 py-1.5 text-sm"
                >
                  <span>{new Date(play.playedAt).toLocaleDateString()}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {new Date(play.playedAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </aside>
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
  return <dd className="text-base font-semibold" {...props} />;
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
