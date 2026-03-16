import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
}

export function StatCard({ label, value, sub, className }: StatCardProps) {
  return (
    <Card size="sm" className={cn("gap-3 rounded-[1.75rem] py-3", className)}>
      <CardContent className="space-y-1 px-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl leading-none font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
