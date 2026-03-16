import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { FeedSection } from "@/components/FeedSection";
import { ScrobbleTimelineChart } from "@/components/ScrobbleTimelineChart";
import { StatCard } from "@/components/StatCard";
import { TimeRangeTabs } from "@/components/TimeRangeTabs";
import { TopArtistsRow } from "@/components/TopArtistsRow";
import { Skeleton } from "@/components/ui/skeleton";
import type { Range } from "@/lib/use-stats";
import { useExtendedStats, useStats } from "@/lib/use-stats";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [range, setRange] = useState<Range>("30d");
  const { data: stats } = useStats(range);
  const { data: extended } = useExtendedStats(range);

  const hours = extended ? Math.round(extended.totalListeningMs / 3_600_000) : 0;

  return (
    <div className="space-y-8 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold">Home</h1>
        <p className="text-sm text-muted-foreground">Your listening universe</p>
      </div>

      <TimeRangeTabs value={range} onChange={setRange} />

      {extended ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Scrobbles" value={extended.totalScrobbles.toLocaleString()} />
          <StatCard label="Listening time" value={`${hours}h`} />
          <StatCard
            label="Mainstream score"
            value={extended.mainstreamScore}
            sub="avg track popularity"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      )}

      {stats && stats.topArtists.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold tracking-widest uppercase opacity-50">
            Top Artists
          </h2>
          <TopArtistsRow artists={stats.topArtists} />
        </div>
      )}

      {extended?.scrobblesByDate && extended.scrobblesByDate.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold tracking-widest uppercase opacity-50">
            Listening over time
          </h2>
          <ScrobbleTimelineChart data={extended.scrobblesByDate} />
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold tracking-widest uppercase opacity-50">
          Friend Activity
        </h2>
        <FeedSection />
      </div>
    </div>
  );
}
