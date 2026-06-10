import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoast } from "@/lib/queries/ai";

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

  async function generate() {
    const result = await mutation.mutateAsync();
    if (isRoast(result)) {
      setData(result);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            {data ? (
              <div className="flex items-center gap-2">
                <CardTitle>{data.verdict}</CardTitle>
                <Stars n={data.rating} />
              </div>
            ) : (
              <>
                <CardTitle>The roast</CardTitle>
                <CardDescription>Survive the verdict</CardDescription>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {mutation.isPending ? <RoastSkeleton /> : null}

        {data && !mutation.isPending ? (
          <>
            <p className="text-sm leading-relaxed">{data.roast}</p>

            <div className="rounded-lg bg-muted px-4 py-3">
              <p className="text-sm font-medium">Guilty pleasure</p>
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
        ) : null}

        {!data && !mutation.isPending ? (
          <Button onClick={generate} variant="outline" size="sm">
            Roast me
          </Button>
        ) : null}

        {mutation.isError ? (
          <p className="text-sm text-destructive">Something went wrong. Try again.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function isRoast(result: unknown): result is Roast {
  return Boolean(result && typeof result === "object" && "verdict" in result);
}

function RoastSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-14 w-full rounded-lg" />
      <Skeleton className="h-6 w-40 rounded-full" />
    </div>
  );
}
