import type { ComponentPropsWithoutRef } from "react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasteDNA } from "@/lib/queries/ai";

interface TasteDNA {
  archetype: string;
  tagline: string;
  traits: string[];
  top_moods: string[];
  persona: string;
  discovery_score: number;
  underground_score: number;
}

function ScoreBarRoot({
  value,
  children,
  ...props
}: ComponentPropsWithoutRef<"div"> & { value: number }) {
  return (
    <div className="flex flex-col gap-1" {...props}>
      <div className="flex justify-between text-xs text-muted-foreground">{children}</div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-chart-1 transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function ScoreBarLabel(props: ComponentPropsWithoutRef<"span">) {
  return <span {...props} />;
}

function ScoreBarValue(props: ComponentPropsWithoutRef<"span">) {
  return <span {...props} />;
}

const ScoreBar = Object.assign(ScoreBarRoot, {
  Label: ScoreBarLabel,
  Value: ScoreBarValue,
});

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
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            {data ? (
              <>
                <CardTitle>{data.archetype}</CardTitle>
                <CardDescription>{data.tagline}</CardDescription>
              </>
            ) : (
              <>
                <CardTitle>Taste DNA</CardTitle>
                <CardDescription>What kind of listener are you?</CardDescription>
              </>
            )}
          </div>
          {cached && data && (
            <Badge variant="secondary" className="mt-1 shrink-0 text-xs">
              This week
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
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

            <div className="flex flex-col gap-2.5">
              <ScoreBar value={data.discovery_score}>
                <ScoreBar.Label>Discovery</ScoreBar.Label>
                <ScoreBar.Value>{data.discovery_score}</ScoreBar.Value>
              </ScoreBar>
              <ScoreBar value={data.underground_score}>
                <ScoreBar.Label>Underground</ScoreBar.Label>
                <ScoreBar.Value>{data.underground_score}</ScoreBar.Value>
              </ScoreBar>
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-6 w-20 rounded-full" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  );
}
