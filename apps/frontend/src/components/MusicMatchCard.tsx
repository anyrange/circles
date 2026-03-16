import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface Match {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  sharedCount: number;
}

interface Props {
  match: Match;
}

export function MusicMatchCard({ match }: Props) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-4">
        <Avatar>
          <AvatarImage src={match.image ?? undefined} alt={match.name} />
          <AvatarFallback>{match.name[0]}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{match.name}</p>
          {match.username && (
            <p className="truncate text-sm text-muted-foreground">@{match.username}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{match.sharedCount}</p>
          <p className="text-xs text-muted-foreground">shared artists</p>
        </div>
      </CardContent>
    </Card>
  );
}
