import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { TrackRow } from "@/components/track-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTimeMachine } from "@/lib/queries/time-machine";

export function TimeMachineView() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [day, setDay] = useState(today.getDate());

  const { data, isLoading } = useTimeMachine(month, day);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Day</label>
          <select
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )}

      {!isLoading && data && Array.isArray(data) && data.length === 0 && (
        <p className="text-muted-foreground">No listening history found for this date.</p>
      )}

      {data &&
        Array.isArray(data) &&
        data.map((yearEntry) => (
          <Card key={yearEntry.year}>
            <CardHeader>
              <CardTitle>{yearEntry.year}</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="flex flex-col gap-2">
                {yearEntry.plays.slice(0, 20).map((play, i) => (
                  <li key={i}>
                    <TrackRow compact asChild>
                      <Link to="/tracks/$trackId" params={{ trackId: play.track.id }}>
                        <TrackRow.Leading>
                          {new Date(play.playedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </TrackRow.Leading>
                        <TrackRow.Artwork />
                        <TrackRow.Content>
                          <TrackRow.Title>{play.track.name}</TrackRow.Title>
                        </TrackRow.Content>
                      </Link>
                    </TrackRow>
                  </li>
                ))}
                {yearEntry.plays.length > 20 && (
                  <li className="text-xs text-muted-foreground">
                    +{yearEntry.plays.length - 20} more
                  </li>
                )}
              </ol>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
