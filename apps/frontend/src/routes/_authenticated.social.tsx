import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { LeaderboardTable } from "@/components/LeaderboardTable";
import { MusicMatchCard } from "@/components/MusicMatchCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLeaderboard, useMusicMatches } from "@/lib/use-social";

export const Route = createFileRoute("/_authenticated/social")({
  component: SocialPage,
});

function SocialPage() {
  const [period, setPeriod] = useState<"week" | "all">("all");
  const { data: leaderboard, isLoading: loadingLB } = useLeaderboard(period);
  const { data: matches, isLoading: loadingMatches } = useMusicMatches();

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-12">
      <h1 className="text-xl font-semibold">Social</h1>

      <Tabs defaultValue="leaderboard">
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="matches">Music Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="mt-4 space-y-4">
          <div className="flex gap-2">
            {(["all", "week"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  period === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "all" ? "All time" : "This week"}
              </button>
            ))}
          </div>

          {loadingLB && (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}

          {leaderboard && <LeaderboardTable entries={leaderboard.leaderboard} />}
        </TabsContent>

        <TabsContent value="matches" className="mt-4">
          {loadingMatches && (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          )}

          {matches && (
            <div className="space-y-3">
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
    </div>
  );
}
