import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { FeedSection } from "@/components/feed-section";
import {
  Page,
  PageDescription,
  PageHeader,
  PageSection,
  PageSectionTitle,
  PageTitle,
} from "@/components/page-shell";
import { StreamsTimelineChart } from "@/components/streams-timeline-chart";
import { TimeRangeTabs } from "@/components/time-range-tabs";
import { TopArtistsRow } from "@/components/top-artists-row";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Range } from "@/lib/queries/stats";
import { useExtendedStats, useStats } from "@/lib/queries/stats";

const DEFAULT_RANGE = "30d";

const searchSchema = z.object({
  range: z.enum(["7d", "30d", "90d", "365d", "all"]).optional().catch(DEFAULT_RANGE),
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  validateSearch: searchSchema,
  component: DashboardPage,
});

function DashboardPage() {
  const { range = DEFAULT_RANGE } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: stats } = useStats(range);
  const { data: extended } = useExtendedStats(range);

  const hours = extended ? Math.round(extended.totalListeningMs / 3_600_000) : 0;

  return (
    <Page>
      <PageHeader>
        <PageTitle>Home</PageTitle>
        <PageDescription>Your listening universe</PageDescription>
      </PageHeader>

      <TimeRangeTabs
        value={range}
        onChange={(nextRange: Range) =>
          navigate({ search: (previous) => ({ ...previous, range: nextRange }) })
        }
      />

      {extended ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Card size="sm">
            <CardHeader>
              <CardDescription>Streams</CardDescription>
              <CardTitle className="text-2xl font-semibold">
                {extended.totalScrobbles.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardDescription>Listening time</CardDescription>
              <CardTitle className="text-2xl font-semibold">{hours}h</CardTitle>
            </CardHeader>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardDescription>Mainstream score</CardDescription>
              <CardTitle className="text-2xl font-semibold">{extended.mainstreamScore}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} size="sm" aria-hidden="true">
              <CardHeader>
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-8 w-20" />
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {stats && stats.topArtists.length > 0 && (
        <PageSection>
          <PageSectionTitle>Top Artists</PageSectionTitle>
          <TopArtistsRow artists={stats.topArtists} />
        </PageSection>
      )}

      {extended?.scrobblesByDate && extended.scrobblesByDate.length > 0 && (
        <PageSection>
          <PageSectionTitle>Listening over time</PageSectionTitle>
          <StreamsTimelineChart data={extended.scrobblesByDate} />
        </PageSection>
      )}

      <PageSection>
        <PageSectionTitle>Friend activity</PageSectionTitle>
        <FeedSection />
      </PageSection>
    </Page>
  );
}
