import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  title: string;
  description: string;
  onGenerate: () => Promise<string>;
}

export function AiToolCard({ title, description, onGenerate }: Props) {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const start = Date.now();
      const text = await onGenerate();
      setCached(Date.now() - start < 500);
      setResult(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {cached && result && (
            <Badge variant="secondary" className="text-xs">
              Cached this week
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        )}
        {result && !loading && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{result}</p>
        )}
        {!result && !loading && (
          <Button onClick={handleGenerate} variant="outline" size="sm">
            Generate
          </Button>
        )}
        {result && !loading && (
          <Button onClick={handleGenerate} variant="ghost" size="sm" className="mt-3">
            Regenerate
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
