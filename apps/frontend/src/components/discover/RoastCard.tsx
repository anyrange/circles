import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoast } from "@/lib/use-ai";

interface Roast {
  roast: string;
  verdict: string;
  guilty_pleasure: string;
  award: string;
  rating: number;
  defense: string;
}

function Stars({ n }: { n: number }) {
  return (
    <span className="text-sm">
      {"★".repeat(Math.max(0, Math.min(5, Math.round(n))))}
      {"☆".repeat(5 - Math.max(0, Math.min(5, Math.round(n))))}
    </span>
  );
}

export function RoastCard() {
  const mutation = useRoast();
  const [data, setData] = useState<Roast | null>(null);
  const [cached, setCached] = useState(false);

  async function generate() {
    const start = Date.now();
    const result = await mutation.mutateAsync();
    if ("verdict" in result) {
      setCached(Date.now() - start < 400);
      setData(result as unknown as Roast);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              The Roast
            </p>
            {data ? (
              <div className="mt-1 flex items-center gap-2">
                <h2 className="text-xl font-bold">{data.verdict}</h2>
                <Stars n={data.rating} />
              </div>
            ) : (
              <h2 className="mt-1 text-lg font-medium text-muted-foreground">
                Survive the verdict
              </h2>
            )}
          </div>
          {cached && data && (
            <Badge variant="secondary" className="mt-1 shrink-0 text-xs">
              This week
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {mutation.isPending && <RoastSkeleton />}

        {data && !mutation.isPending && (
          <>
            <p className="text-sm leading-relaxed">{data.roast}</p>

            <div className="rounded-lg bg-muted px-4 py-3">
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Guilty pleasure
              </p>
              <p className="mt-1 text-sm italic">{data.guilty_pleasure}</p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                🏆 {data.award}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground">In your defense: {data.defense}</p>

            <Button onClick={generate} variant="ghost" size="sm" className="text-xs">
              Roast me again
            </Button>
          </>
        )}

        {!data && !mutation.isPending && (
          <Button onClick={generate} variant="outline" size="sm">
            Roast me
          </Button>
        )}

        {mutation.isError && (
          <p className="text-sm text-destructive">Something went wrong. Try again.</p>
        )}
      </CardContent>
    </Card>
  );
}

function RoastSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-14 w-full rounded-lg" />
      <Skeleton className="h-6 w-40 rounded-full" />
    </div>
  );
}
