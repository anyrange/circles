import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  title: string;
  description: string;
  onGenerate: () => Promise<string>;
}

export function AiToolCard({ title, description, onGenerate }: Props) {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const text = await onGenerate();
      setResult(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {loading && (
          <div className="flex flex-col gap-2">
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
          <Button onClick={handleGenerate} variant="ghost" size="sm">
            Regenerate
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
