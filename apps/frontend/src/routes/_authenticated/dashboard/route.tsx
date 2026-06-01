import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { FeedSection } from "@/components/feed-section";
import {
  Page,
  PageDescription,
  PageHeader,
  PageSection,
  PageSectionTitle,
  PageTitle,
} from "@/components/page-shell";
import { ScrobbleTimelineChart } from "@/components/scrobble-timeline-chart";
import { TimeRangeTabs } from "@/components/time-range-tabs";
import { TopArtistsRow } from "@/components/top-artists-row";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Range } from "@/lib/queries/stats";
import { useExtendedStats, useStats } from "@/lib/queries/stats";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [range, setRange] = useState<Range>("30d");
  const { data: stats } = useStats(range);
  const { data: extended } = useExtendedStats(range);

  const hours = extended ? Math.round(extended.totalListeningMs / 3_600_000) : 0;

  return (
    <Page>
      <PageHeader>
        <PageTitle>Home</PageTitle>
        <PageDescription>Your listening universe</PageDescription>
      </PageHeader>

      <TimeRangeTabs value={range} onChange={setRange} />

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
              <CardDescription>avg track popularity</CardDescription>
            </CardHeader>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
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
          <ScrobbleTimelineChart data={extended.scrobblesByDate} />
        </PageSection>
      )}

      <PageSection>
        <PageSectionTitle>Friend activity</PageSectionTitle>
        <FeedSection />
      </PageSection>
    </Page>
  );
}
