import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { LeaderboardTable } from "@/components/leaderboard-table";
import { MusicMatchCard } from "@/components/music-match-card";
import { Page, PageHeader, PageTitle } from "@/components/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLeaderboard, useMusicMatches } from "@/lib/queries/social";

export const Route = createFileRoute("/_authenticated/social")({
  component: SocialPage,
});

function SocialPage() {
  const [period, setPeriod] = useState<"week" | "all">("all");
  const { data: leaderboard, isLoading: loadingLB } = useLeaderboard(period);
  const { data: matches, isLoading: loadingMatches } = useMusicMatches();

  return (
    <Page>
      <PageHeader>
        <PageTitle>Social</PageTitle>
      </PageHeader>

      <Tabs defaultValue="leaderboard">
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="matches">Music Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="mt-4 flex flex-col gap-4">
          <Tabs
            value={period}
            onValueChange={(value) => {
              if (value === "week" || value === "all") {
                setPeriod(value);
              }
            }}
          >
            <TabsList>
              <TabsTrigger value="all">All time</TabsTrigger>
              <TabsTrigger value="week">This week</TabsTrigger>
            </TabsList>
          </Tabs>

          {loadingLB && (
            <div className="flex flex-col gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}

          {leaderboard && <LeaderboardTable entries={leaderboard.leaderboard} />}
        </TabsContent>

        <TabsContent value="matches" className="mt-4">
          {loadingMatches && (
            <div className="flex flex-col gap-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          )}

          {matches && (
            <div className="flex flex-col gap-3">
              {matches.matches.length === 0 && (
                <p className="text-muted-foreground">No music matches found yet.</p>
              )}
              {matches.matches.map((match) => (
                <MusicMatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Page>
  );
}
