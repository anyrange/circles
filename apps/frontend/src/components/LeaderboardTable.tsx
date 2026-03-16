import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Entry {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  scrobbleCount: number;
}

interface Props {
  entries: Entry[];
}

export function LeaderboardTable({ entries }: Props) {
  return (
    <ol className="space-y-2">
      {entries.map((entry, i) => (
        <li key={entry.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50">
          <span className="w-6 text-right font-mono text-sm text-muted-foreground">{i + 1}</span>
          <Avatar className="size-8">
            <AvatarImage src={entry.image ?? undefined} alt={entry.name} />
            <AvatarFallback>{entry.name[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{entry.name}</p>
            {entry.username && (
              <p className="truncate text-xs text-muted-foreground">@{entry.username}</p>
            )}
          </div>
          <span className="text-sm text-muted-foreground tabular-nums">
            {entry.scrobbleCount.toLocaleString()}
          </span>
        </li>
      ))}
    </ol>
  );
}
