import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSceneReport } from "@/lib/queries/ai";

interface SceneReport {
  scene_name: string;
  description: string;
  vibe_words: string[];
  anthem: string;
  kindred_artists: string[];
}

export function SceneReportCard() {
  const mutation = useSceneReport();
  const [data, setData] = useState<SceneReport | null>(null);
  const [cached, setCached] = useState(false);

  async function generate() {
    const start = Date.now();
    const result = await mutation.mutateAsync();
    if ("scene_name" in result) {
      setCached(Date.now() - start < 400);
      setData(result as unknown as SceneReport);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            {data ? (
              <>
                <CardTitle>{data.scene_name}</CardTitle>
                <CardDescription>Scene report</CardDescription>
              </>
            ) : (
              <>
                <CardTitle>Scene report</CardTitle>
                <CardDescription>Where do you belong?</CardDescription>
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

      <CardContent className="flex flex-col gap-4">
        {mutation.isPending && <SceneSkeleton />}

        {data && !mutation.isPending && (
          <>
            <p className="text-sm leading-relaxed">{data.description}</p>

            <div className="flex flex-wrap gap-1.5">
              {data.vibe_words.map((w) => (
                <Badge key={w} variant="outline" className="text-xs capitalize">
                  {w}
                </Badge>
              ))}
            </div>

            <div className="rounded-lg bg-muted px-4 py-3">
              <p className="text-sm font-medium">Anthem</p>
              <p className="mt-1 text-sm italic">{data.anthem}</p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Kindred artists</p>
              <div className="flex flex-wrap gap-1.5">
                {data.kindred_artists.map((a) => (
                  <span key={a} className="text-sm font-medium">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <Button onClick={generate} variant="ghost" size="sm" className="text-xs">
              Regenerate
            </Button>
          </>
        )}

        {!data && !mutation.isPending && (
          <Button onClick={generate} variant="outline" size="sm">
            Find my scene
          </Button>
        )}

        {mutation.isError && (
          <p className="text-sm text-destructive">Something went wrong. Try again.</p>
        )}
      </CardContent>
    </Card>
  );
}

function SceneSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-6 w-16 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-14 w-full rounded-lg" />
    </div>
  );
}
