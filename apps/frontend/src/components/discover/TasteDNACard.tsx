import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasteDNA } from "@/lib/use-ai";

interface TasteDNA {
  archetype: string;
  tagline: string;
  traits: string[];
  top_moods: string[];
  persona: string;
  discovery_score: number;
  underground_score: number;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-chart-1 transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function TasteDNACard() {
  const mutation = useTasteDNA();
  const [data, setData] = useState<TasteDNA | null>(null);
  const [cached, setCached] = useState(false);

  async function generate() {
    const start = Date.now();
    const result = await mutation.mutateAsync();
    if ("archetype" in result) {
      setCached(Date.now() - start < 400);
      setData(result as unknown as TasteDNA);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Taste DNA
            </p>
            {data ? (
              <h2 className="mt-1 text-2xl font-bold">{data.archetype}</h2>
            ) : (
              <h2 className="mt-1 text-lg font-medium text-muted-foreground">
                What kind of listener are you?
              </h2>
            )}
          </div>
          {cached && data && (
            <Badge variant="secondary" className="mt-1 shrink-0 text-xs">
              This week
            </Badge>
          )}
        </div>
        {data && <p className="text-sm text-muted-foreground italic">{data.tagline}</p>}
      </CardHeader>

      <CardContent className="space-y-5">
        {mutation.isPending && <TasteDNASkeleton />}

        {data && !mutation.isPending && (
          <>
            <p className="text-sm leading-relaxed">{data.persona}</p>

            <div className="flex flex-wrap gap-1.5">
              {data.traits.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {data.top_moods.map((m) => (
                <span key={m} className="text-xs text-muted-foreground">
                  {m}
                </span>
              ))}
            </div>

            <div className="space-y-2.5">
              <ScoreBar label="Discovery" value={data.discovery_score} />
              <ScoreBar label="Underground" value={data.underground_score} />
            </div>

            <Button onClick={generate} variant="ghost" size="sm" className="text-xs">
              Regenerate
            </Button>
          </>
        )}

        {!data && !mutation.isPending && (
          <Button onClick={generate} variant="outline" size="sm">
            Reveal my DNA
          </Button>
        )}

        {mutation.isError && (
          <p className="text-sm text-destructive">Something went wrong. Try again.</p>
        )}
      </CardContent>
    </Card>
  );
}

function TasteDNASkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-6 w-20 rounded-full" />
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  );
}
